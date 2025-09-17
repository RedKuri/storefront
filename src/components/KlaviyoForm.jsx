import { useEffect } from 'react';

export default function KlaviyoForm() {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://static.klaviyo.com/onsite/js/klaviyo.js?company_id=UVqsjw';
    script.async = true;
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  return <div className="klaviyo-form-RqmjMf" />;
}

