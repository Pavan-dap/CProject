@@ .. @@
                   {item.type === 'task' && (() => {
                     const taskId = parseInt(item.id.replace('task-', ''));
                     const { dependencies } = getTaskDependencies(taskId);
                     const canStart = canStartTask(taskId);
                     return (
                       <>
                         {dependencies.length > 0 && (
-                          <LinkOutlined style={{ marginRight: 4, color: '#1890ff', fontSize: '12px' }} />
+                          <div style={{ 
+                            position: 'absolute', 
+                            right: 8, 
+                            top: '50%', 
+                            transform: 'translateY(-50%)',
+                            display: 'flex',
+                            gap: 4
+                          }}>
+                            <LinkOutlined style={{ color: '#1890ff', fontSize: '12px' }} />
+                            {!canStart && (
+                              <ExclamationCircleOutlined style={{ color: '#faad14', fontSize: '12px' }} />
+                            )}
+                          </div>
                         )}
-                        {!canStart && (
-                          <ExclamationCircleOutlined style={{ marginRight: 4, color: '#faad14', fontSize: '12px' }} />
-                        )}
                       </>
                     );
                   })()}