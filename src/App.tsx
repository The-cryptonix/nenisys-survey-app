import { useEffect } from 'react';
import { Layout } from './components/Layout';
import { ToastProvider } from './components/Toasts';
import { useSurvey } from './hooks/useSurvey';
import { useRoute } from './lib/useRoute';
import { LegalPage } from './pages/LegalPage';
import { SurveyView } from './pages/SurveyView';

function Shell() {
  const route = useRoute();
  const survey = useSurvey();

  useEffect(() => {
    if (route.kind === 'home') window.scrollTo(0, 0);
  }, [route.kind]);

  return <Layout>{route.kind === 'legal' ? <LegalPage id={route.id} /> : <SurveyView s={survey} />}</Layout>;
}

export function App() {
  return (
    <ToastProvider>
      <Shell />
    </ToastProvider>
  );
}
