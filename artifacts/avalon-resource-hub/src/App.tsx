import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import PublicHub from "@/pages/PublicHub";
import StaffArea from "@/pages/StaffArea";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={PublicHub} />
      <Route path="/staff" component={StaffArea} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <>
      <Router />
      <Toaster />
    </>
  );
}

export default App;
