import { useEffect } from 'react';
import { toast } from 'react-hot-toast';



export const usePreventCopy = () => {
    useEffect(() => {
      const preventCopy = (e) => {
        e.preventDefault();
        toast.error('Copying is not allowed during the test!');
        return false;
      };

      document.addEventListener('copy', preventCopy);
      document.addEventListener('paste', preventCopy);
      document.addEventListener('cut', preventCopy);

      return () => {
        document.removeEventListener('copy', preventCopy);
        document.removeEventListener('paste', preventCopy);
        document.removeEventListener('cut', preventCopy);
      };
    }, []);
  };