// Utility functions for ensuring immediate UI updates

export const forceUpdate = () => {
  // Utility to force component re-render if needed
  return Date.now();
};

export const validateAndUpdateLocalStorage = (key: string, data: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    // Dispatch a custom event to notify other components
    window.dispatchEvent(new CustomEvent('localStorageUpdate', {
      detail: { key, data }
    }));
    return true;
  } catch (error) {
    console.error('Failed to update localStorage:', error);
    return false;
  }
};

export const getFromLocalStorage = (key: string, defaultValue: any = null) => {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : defaultValue;
  } catch (error) {
    console.error('Failed to read from localStorage:', error);
    return defaultValue;
  }
};

// Debounce function for performance optimization
export const debounce = (func: Function, wait: number) => {
  let timeout: NodeJS.Timeout;
  return function executedFunction(...args: any[]) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Function to ensure state consistency
export const ensureStateConsistency = (state: any[]) => {
  // Return a new array reference to force React re-render
  return [...state];
};
