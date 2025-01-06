import React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import { PrivateRoute } from "./components/common/PrivateRoute";
import Layout from "./components/layout/Layout";
import ToastManager from "./components/common/ToastManager";
import { APP_ROUTES } from "./constants/routes";
import WorkflowCanvas from "./components/workflow/WorkflowCanvas";

// Auth Pages
import LoginPage from "./containers/auth/LoginPage";
import RegisterPage from "./containers/auth/RegisterPage";
import ForgotPasswordPage from "./containers/auth/ForgotPasswordPage";
import ChangePasswordPage from "./containers/auth/ChangePasswordPage";

// Dashboard Pages
import DashboardPage from "./containers/dashboard/DashboardPage";
import OverviewPage from "./containers/dashboard/OverviewPage";

// Project Pages
import ProjectListPage from "./containers/projects/ProjectListPage";
import ProjectDetailPage from "./containers/projects/ProjectDetailPage";

// App Pages
import AppListPage from "./containers/apps/AppListPage";
import AppDetailPage from "./containers/apps/AppDetailPage";
import BuildDeployPage from "./containers/apps/BuildDeployPage";
import BuildHistoryPage from "./containers/apps/BuildHistoryPage";
import DeploymentHistoryPage from "./containers/apps/DeploymentHistoryPage";
import AppMetricsPage from "./containers/apps/AppMetricsPage";
import AppConfigurationPage from "./containers/apps/AppConfigurationPage";
import PodShellPage from "./containers/apps/PodShellPage";

// Cluster Pages
import ClusterPage from "./pages/ClusterPage";

// Service Pages
import { ServicesPage } from "./pages/ServicesPage";

// Settings Pages
import SettingsPage from "./containers/settings/SettingsPage";
import GitUserPage from "./containers/settings/GitUserPage";
import ContainerRegistryPage from "./containers/settings/ContainerRegistryPage";
import GitHubCallBack from "./containers/settings/GitHubCallBack";
import GitHubAppDetails from "./containers/settings/GitHubAppDetails";

// User Pages
import UserProfilePage from "./containers/user/UserProfilePage";
import NotFoundPage from "./containers/user/NotFoundPage";

const App = () => {
  return (
    <Router>
      <Switch>
        {/* Public Routes */}
        <Route exact path={["/", APP_ROUTES.AUTH.LOGIN]} component={LoginPage} />
        <Route path={APP_ROUTES.AUTH.REGISTER} component={RegisterPage} />
        <Route path={APP_ROUTES.AUTH.FORGOT_PASSWORD} component={ForgotPasswordPage} />
        <Route path={APP_ROUTES.AUTH.CHANGE_PASSWORD} component={ChangePasswordPage} />

        {/* Private Routes */}
        <PrivateRoute path="/">
          <Layout>
            <Switch>
              <Route exact path={APP_ROUTES.APP.DASHBOARD} component={DashboardPage} />
              <Route exact path={APP_ROUTES.APP.OVERVIEW} component={OverviewPage} />
              <Route exact path={APP_ROUTES.APP.PROJECTS} component={ProjectListPage} />
              <Route exact path={APP_ROUTES.APP.APPS} component={AppListPage} />
              
              {/* App Routes */}
              <Route path="/app/:appId/details" component={AppDetailPage} />
              <Route path="/app/:appId/build-deploy" component={BuildDeployPage} />
              <Route path="/app/:appId/build-history" component={BuildHistoryPage} />
              <Route path="/app/:appId/deployment-history" component={DeploymentHistoryPage} />
              <Route path="/app/:appId/metrics" component={AppMetricsPage} />
              <Route path="/app/:appId/app-configuration" component={AppConfigurationPage} />
              <Route path="/app/:appId/pod-shell" component={PodShellPage} />
              <Route path="/app/:appId/workflow" component={WorkflowCanvas} />

              {/* Settings Routes */}
              <Route exact path={APP_ROUTES.SETTINGS.ROOT} component={SettingsPage} />
              <Route exact path={APP_ROUTES.SETTINGS.GIT_ACCOUNT} component={GitUserPage} />
              <Route exact path={APP_ROUTES.SETTINGS.CONTAINER_REGISTRY} component={ContainerRegistryPage} />
              <Route exact path="/github-source" component={GitHubCallBack} />
              <Route exact path="/github-callback" component={GitHubCallBack} />
              <Route exact path="/settings/github-app/:appId" component={GitHubAppDetails} />

              <Route exact path="/user-profile" component={UserProfilePage} />
              <Route path="/project/:projectId/apps" component={ProjectDetailPage} />
              
              {/* Cluster Routes */}
              <PrivateRoute exact path="/cluster" component={ClusterPage} />
              <PrivateRoute exact path="/services" component={ServicesPage} />
              {/* Workflow Routes */}
              {/* <Route exact path="/workflow" component={WorkflowCanvas} /> */}
              <Route path="*" component={NotFoundPage} />


              
            </Switch>
          </Layout>
        </PrivateRoute>
      </Switch>
      <ToastManager />
    </Router>
  );
};

export default App;
