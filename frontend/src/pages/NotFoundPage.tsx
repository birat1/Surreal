import { useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/button';

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full bg-blue-100 flex flex-col items-center justify-center text-center p-6">
      <h1 className="text-7xl font-extrabold text-blue-700 mb-4">404</h1>

      <p className="text-xl text-blue-800 font-medium max-w-md mb-8">
        Looks like you've wandered off campus. This page doesn't exist!
      </p>

      <Button className="mt-2 text-lg px-6 py-5" onClick={() => navigate('/')}>
        Take Me Home
      </Button>
    </div>
  );
};

export default NotFoundPage;
