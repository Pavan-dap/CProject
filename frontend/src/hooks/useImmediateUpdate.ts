import { useCallback, useEffect, useState } from 'react';

// Custom hook to ensure immediate UI updates
export const useImmediateUpdate = () => {
  const [updateTrigger, setUpdateTrigger] = useState(0);

  const forceUpdate = useCallback(() => {
    setUpdateTrigger(prev => prev + 1);
  }, []);

  return { updateTrigger, forceUpdate };
};

// Custom hook for localStorage synchronization
export const useLocalStorageSync = (key: string, initialValue: any) => {
  const [value, setValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setStoredValue = useCallback((newValue: any) => {
    try {
      setValue(newValue);
      window.localStorage.setItem(key, JSON.stringify(newValue));
      
      // Dispatch custom event for cross-component updates
      window.dispatchEvent(new CustomEvent('localStorageChange', {
        detail: { key, value: newValue }
      }));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key]);

  // Listen for localStorage changes from other tabs/components
  useEffect(() => {
    const handleStorageChange = (e: CustomEvent) => {
      if (e.detail.key === key) {
        setValue(e.detail.value);
      }
    };

    window.addEventListener('localStorageChange', handleStorageChange as EventListener);
    
    return () => {
      window.removeEventListener('localStorageChange', handleStorageChange as EventListener);
    };
  }, [key]);

  return [value, setStoredValue] as const;
};

// Hook for real-time data validation
export const useRealTimeValidation = (data: any[], validator?: (item: any) => boolean) => {
  const [isValid, setIsValid] = useState(true);
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    if (validator) {
      const validationErrors: string[] = [];
      const allValid = data.every((item, index) => {
        const valid = validator(item);
        if (!valid) {
          validationErrors.push(`Item at index ${index} is invalid`);
        }
        return valid;
      });
      
      setIsValid(allValid);
      setErrors(validationErrors);
    }
  }, [data, validator]);

  return { isValid, errors };
};
