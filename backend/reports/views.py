from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.shortcuts import get_object_or_404
from django.http import HttpResponse
from django.template.loader import render_to_string
from django.utils import timezone
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
import uuid
import os
from .models import Report, ReportShare
from .serializers import ReportSerializer, ReportShareSerializer
from projects.models import Project
from tasks.models import Task

class ReportViewSet(viewsets.ModelViewSet):
    serializer_class = ReportSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        queryset = Report.objects.select_related('project', 'generated_by')
        
        if user.role == 'admin':
            return queryset
        elif user.role == 'manager':
            return queryset.filter(project__manager=user)
        elif user.role == 'incharge':
            return queryset.filter(project__assignments__user=user, project__assignments__is_active=True)
        else:
            return queryset.filter(generated_by=user)
    
    @action(detail=False, methods=['post'])
    def generate_project_status(self, request):
        project_id = request.data.get('project_id')
        project = get_object_or_404(Project, id=project_id)
        
        # Generate PDF report
        report_data = self._generate_project_status_data(project)
        pdf_path = self._create_pdf_report(project, report_data)
        
        # Create report record
        report = Report.objects.create(
            title=f"Project Status Report - {project.name}",
            report_type='project_status',
            project=project,
            generated_by=request.user,
            file_path=pdf_path
        )
        
        return Response(ReportSerializer(report).data, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['post'])
    def make_public(self, request, pk=None):
        report = self.get_object()
        if not report.public_link:
            report.public_link = str(uuid.uuid4())
            report.is_public = True
            report.save()
        
        public_url = f"{request.build_absolute_uri('/')[:-1]}/api/reports/public/{report.public_link}/"
        return Response({'public_url': public_url})
    
    @action(detail=True, methods=['post'])
    def share_via_email(self, request, pk=None):
        report = self.get_object()
        email = request.data.get('email')
        
        if not email:
            return Response({'error': 'Email is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Create share record
        share = ReportShare.objects.create(
            report=report,
            shared_with_email=email,
            shared_by=request.user
        )
        
        # In a real application, you would send an email here
        # send_report_email(email, report, request.user)
        
        return Response(ReportShareSerializer(share).data, status=status.HTTP_201_CREATED)
    
    def _generate_project_status_data(self, project):
        tasks = Task.objects.filter(project=project)
        hierarchy = project.hierarchy.all()
        
        # Calculate statistics
        total_tasks = tasks.count()
        completed_tasks = tasks.filter(status='completed').count()
        in_progress_tasks = tasks.filter(status='in-progress').count()
        pending_tasks = tasks.filter(status='not-started').count()
        
        # Group by hierarchy
        hierarchy_data = {}
        for item in hierarchy:
            block = item.block_name
            floor = item.floor_number
            
            if block not in hierarchy_data:
                hierarchy_data[block] = {}
            if floor not in hierarchy_data[block]:
                hierarchy_data[block][floor] = []
            
            hierarchy_data[block][floor].append({
                'unit_number': item.unit_number,
                'unit_type': item.unit_type,
                'completion_percentage': float(item.completion_percentage),
                'tasks': list(item.tasks.values('title', 'status', 'progress'))
            })
        
        return {
            'project': project,
            'statistics': {
                'total_tasks': total_tasks,
                'completed_tasks': completed_tasks,
                'in_progress_tasks': in_progress_tasks,
                'pending_tasks': pending_tasks,
                'completion_rate': (completed_tasks / total_tasks * 100) if total_tasks > 0 else 0
            },
            'hierarchy': hierarchy_data,
            'tasks': tasks
        }
    
    def _create_pdf_report(self, project, data):
        filename = f"project_status_{project.id}_{timezone.now().strftime('%Y%m%d_%H%M%S')}.pdf"
        filepath = os.path.join('media', 'reports', filename)
        
        # Ensure directory exists
        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        
        # Create PDF
        doc = SimpleDocTemplate(filepath, pagesize=A4)
        styles = getSampleStyleSheet()
        story = []
        
        # Title
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=24,
            spaceAfter=30,
            textColor=colors.HexColor('#1890ff')
        )
        story.append(Paragraph(f"Project Status Report: {project.name}", title_style))
        story.append(Spacer(1, 20))
        
        # Project Info
        project_info = [
            ['Project Name:', project.name],
            ['Client:', project.client],
            ['Location:', project.location],
            ['Buildings:', str(project.buildings)],
            ['Total Units:', str(project.units)],
            ['Status:', project.status.title()],
            ['Progress:', f"{project.progress}%"]
        ]
        
        project_table = Table(project_info, colWidths=[2*inch, 4*inch])
        project_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (0, -1), colors.grey),
            ('TEXTCOLOR', (0, 0), (0, -1), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
            ('BACKGROUND', (1, 0), (1, -1), colors.beige),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))
        
        story.append(project_table)
        story.append(Spacer(1, 20))
        
        # Statistics
        stats = data['statistics']
        stats_data = [
            ['Metric', 'Count', 'Percentage'],
            ['Total Tasks', str(stats['total_tasks']), '100%'],
            ['Completed Tasks', str(stats['completed_tasks']), f"{stats['completion_rate']:.1f}%"],
            ['In Progress Tasks', str(stats['in_progress_tasks']), f"{(stats['in_progress_tasks']/stats['total_tasks']*100) if stats['total_tasks'] > 0 else 0:.1f}%"],
            ['Pending Tasks', str(stats['pending_tasks']), f"{(stats['pending_tasks']/stats['total_tasks']*100) if stats['total_tasks'] > 0 else 0:.1f}%"]
        ]
        
        stats_table = Table(stats_data, colWidths=[2*inch, 1*inch, 1*inch])
        stats_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))
        
        story.append(Paragraph("Project Statistics", styles['Heading2']))
        story.append(stats_table)
        
        # Build PDF
        doc.build(story)
        
        return filepath

@api_view(['GET'])
@permission_classes([AllowAny])
def public_report_view(request, public_link):
    try:
        report = Report.objects.get(public_link=public_link, is_public=True)
        
        # Update access count
        for share in report.shares.all():
            share.access_count += 1
            share.last_accessed = timezone.now()
            share.save()
        
        # Return report data
        if report.report_type == 'project_status':
            project = report.project
            report_data = ReportViewSet()._generate_project_status_data(project)
            
            return Response({
                'report': ReportSerializer(report).data,
                'data': report_data
            })
        
        return Response({'error': 'Report type not supported'}, status=status.HTTP_400_BAD_REQUEST)
        
    except Report.DoesNotExist:
        return Response({'error': 'Report not found'}, status=status.HTTP_404_NOT_FOUND)