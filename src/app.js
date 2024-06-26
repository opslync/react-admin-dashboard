import React from "react";
import LoginPage from "./containers/login";
import { Grid } from '@mui/material';

import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import { PrivateRoute } from "./library/helper";

import ToastManager from "./components/toast";

// pages
import DashboardPage from "./containers/dashboard";
import ProjectPage from "./containers/project";
import RegisterPage from "./containers/register";
import ForgotpasswordPage from "./containers/forgotpassword";
import ChangepasswordPage from "./containers/changepassword";
import NotfoundPage from "./containers/notfound";
import UserProfilePage from "./containers/userprofile";
import AppPage from "./containers/AppPage";
import AppDetailPage from "./containers/AppDetailPage";
import ProjectDetailPage from "./containers/ProjectDetailPage";
import OverviewPage from "./containers/OverviewPage";
import DeploymentHistory from "./containers/DeploymentHistory";
import GitUserPage from "./containers/GitUserPage";
import BuildDeployPage from "./containers/BuildDeployPage";
import BuildHistoryPage from "./containers/BuildHistoryPage";
import AppMetricsPage from "./containers/AppMetricsPage"
import SettingsPage from "./containers/SettingsPage.js";
import ContainerRegistryPage from "./containers/ContainerRegistryPage"
import AppConfigurationPage from "./containers/AppConfigurationPage"

function App() {
  return (
    <>
      <Router>
        <Switch>
          <Route exact path="/" component={LoginPage} />
          <Route exact path="/login" component={LoginPage} />
          <Route exact path="/register" component={RegisterPage} />
          <Route exact path="/forgot-password" component={ForgotpasswordPage} />
          <Route exact path="/change-password" component={ChangepasswordPage} />
          <PrivateRoute exact path="/dashboard" component={DashboardPage} />
          <PrivateRoute exact path="/settings/git-account" component={GitUserPage} />
          <PrivateRoute exact path="/settings/container-oci-registry" component={ContainerRegistryPage} />
          <PrivateRoute exact path="/settings" component={SettingsPage} />
          <PrivateRoute exact path="/overview" component={OverviewPage} />
          <PrivateRoute path="/app/:appId/details" component={AppDetailPage} />
          <PrivateRoute path="/app/:appId/build-deploy" component={BuildDeployPage} />
          <PrivateRoute path="/app/:appId/deployment-history" component={DeploymentHistory} />
          <PrivateRoute path="/app/:appId/build-history" component={BuildHistoryPage} />
          <PrivateRoute path="/app/:appId/metrics" component={AppMetricsPage} />
          <PrivateRoute path="/app/:appId/app-configuration" component={AppConfigurationPage} />
          <PrivateRoute path="/project/:projectId/apps" component={ProjectDetailPage} />
          <PrivateRoute path="/project/:projectId/apps" component={AppPage} />
          <PrivateRoute exact path="/apps" component={AppPage} />
          <PrivateRoute exact path="/project" component={ProjectPage} />
          <PrivateRoute exact path="/user-profile" component={UserProfilePage} />
          <Route path="*" component={NotfoundPage} />
        </Switch>
      </Router>

      <ToastManager />
    </>
  );
}

export default App;
