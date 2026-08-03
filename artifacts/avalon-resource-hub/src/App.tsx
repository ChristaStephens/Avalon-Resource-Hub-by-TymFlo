import { Router, Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import PublicHub from "@/pages/PublicHub";
import StaffArea from "@/pages/StaffArea";
import ProviderApplication from "@/pages/ProviderApplication";
import RequestEdit from "@/pages/RequestEdit";
import NotFound from "@/pages/not-found";

const base = import.meta.env.BASE_URL.replace(/\/$/, "");

function AppRouter() {
  return (
    <Router base={base}>
      <Switch>
        <Route path="/" component={PublicHub} />
        <Route path="/staff" component={StaffArea} />
        <Route path="/become-a-provider" component={ProviderApplication} />
        <Route path="/request-edit" component={RequestEdit} />
        <Route component={NotFound} />
      </Switch>
    </Router>
  );
}

function App() {
  return (
    <>
      <AppRouter />
      <Toaster />
    </>
  );
}

export default App;
