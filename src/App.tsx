import { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Loader from "./components/Loader";
import Sidebar from "./components/Sidebar";
import type {
  Aspect,
  Complaint,
  Doctor,
  Platform,
  Reason,
  Review,
  Reward,
  Service,
  Source,
  User
} from "./types";
import { getCurrentUser, removeAccessToken } from "./utils/api";

export default function App() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [aspects, setAspects] = useState<Aspect[]>([]);
  const [sources, setSources] = useState<Source[]>([]);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [reasons, setReasons] = useState<Reason[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isUserLoading, setIsUserLoading] = useState(true);

  const navigate = useNavigate();
  const location = useLocation();

  const isLoginPage = location.pathname === "/login";

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setIsUserLoading(true);
        const user = await getCurrentUser();
        setCurrentUser(user);
      } catch (error) {
        setCurrentUser(null);
        navigate("/login");
      } finally {
        setIsUserLoading(false);
      }
    };

    if (!isLoginPage) fetchUser();
    else setIsUserLoading(false);
  }, [navigate, isLoginPage]);

  const handleLogout = () => {
    removeAccessToken();
    setCurrentUser(null);
    navigate("/login");
  };

  return (
    <div className="w-full min-h-screen bg-[#F5F5F5] flex">
      {!isLoginPage && (
        <Sidebar
          currentUser={currentUser}
          handleLogout={handleLogout}
          isUserLoading={isUserLoading}
        />
      )}

      <div className={`flex-1 min-w-0 ${isLoginPage ? "" : "p-6"}`}>
        {isUserLoading ? (
          <div className="w-full h-full flex items-center justify-center">
            <Loader />
          </div>
        ) : (
          <Outlet
            context={{
              doctors,
              setDoctors,
              services,
              setServices,
              aspects,
              setAspects,
              sources,
              setSources,
              rewards,
              setRewards,
              platforms,
              setPlatforms,
              reasons,
              setReasons,
              users,
              setUsers,
              reviews,
              setReviews,
              complaints,
              setComplaints,
              currentUser,
              setCurrentUser
            }}
          />
        )}
      </div>
    </div>
  );
}
