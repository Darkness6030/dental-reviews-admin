import { createBrowserRouter } from "react-router-dom"
import App from "./App"
import AspectsPage from "./pages/AspectsPage"
import DashboardPage from "./pages/DashboardPage"
import DoctorsPage from "./pages/DoctorsPage"
import LoginPage from "./pages/LoginPage"
import PlatformsPage from "./pages/PlatformsPage"
import PromptsPage from "./pages/PromptsPage"
import ReasonsPage from "./pages/ReasonsPage"
import RewardsPage from "./pages/RewardsPage"
import ServicesPage from "./pages/ServicesPage"
import SourcesPage from "./pages/SourcesPage"
import UsersPage from "./pages/UsersPage"

export const router = createBrowserRouter([
    {
        path: "/",
        element: <App />,
        children: [
            { index: true, element: <DashboardPage /> },
            { path: "analytics", element: <DashboardPage mode="analytics" /> },
            { path: "login", element: <LoginPage /> },
            { path: "doctors", element: <DoctorsPage /> },
            { path: "services", element: <ServicesPage /> },
            { path: "aspects", element: <AspectsPage /> },
            { path: "sources", element: <SourcesPage /> },
            { path: "rewards", element: <RewardsPage /> },
            { path: "platforms", element: <PlatformsPage /> },
            { path: "reasons", element: <ReasonsPage /> },
            { path: "users", element: <UsersPage /> },
            { path: "prompts", element: <PromptsPage /> }
        ]
    }
])
