import React, { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Exambox from "../components/Exambox";
import AlertMessage from "../components/AlertMessage";
import ExamContext from "../context/exams/examContext";
import AddApplication from "./components/AddApplication";

const UserPanel = () => {
  const navigate = useNavigate();
  const { applicationExams, userAppliedExams, fetchExams,ongoingExams, error } = useContext(ExamContext);
  const [alertMessage, setAlertMessage] = useState("");
  const [applyExam, setApplyExam] = useState(null);
  const [activeTab, setActiveTab] = useState("live");
  const [user, setUser] = useState(null);
  const [applications, setUserApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startedExams, setStartedExams] = useState([]);

  const host = "https://onlineexam-rcrg.onrender.com";
  const authToken = localStorage.getItem("token");

  useEffect(() => {
    if (!authToken) {
      setAlertMessage("You are not logged in. Redirecting to login page...");
      setTimeout(() => {
        navigate("/");
      }, 3000);
      return;
    }

    const fetchUserData = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${host}/api/auth/getuser`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            authtoken: authToken,
          },
        });
        const fetchedUser = await response.json();
        setUser(fetchedUser);
      } catch (error) {
        console.error("Failed to fetch user", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [authToken, navigate]);

  useEffect(() => {
    fetchExams("application-process");
    fetchExams("ongoing");
  }, []);

    useEffect(() => {
    if (user && user._id) {
      const fetchUserApplications = async () => {
        try {
          const response = await fetch(`${host}/api/exams/user-applications/${user._id}`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          });
          const applications = await response.json();
          if (response.ok) {
            setUserApplications(applications);
          } else {
            setAlertMessage(applications.message);
          }
        } catch (error) {
          setAlertMessage(error.message);
        }
      };

      fetchUserApplications();
    }
  }, [user]);

  // Poll for exam status updates
  useEffect(() => {
    const intervalId = setInterval(() => {
      fetchExams("application-process");
    }, 10000); // Poll every 10 seconds

    return () => clearInterval(intervalId);
  }, [fetchExams]);

  if (loading) {
    return <h2 className="text-light mt-5">Loading...</h2>;
  }

  if (!user) {
    return <h2 className="text-warning mt-5">No data available</h2>;
  }

  const handleApply = (exam) => {
    setApplyExam(exam);
  };

  const handleClose = () => {
    setApplyExam(null);
  };

  const renderContent = () => {
    switch (activeTab) {
      case "live":
        return (
          <div>
            {applicationExams.map((exam) => (
              <Exambox
                key={exam._id}
                exam={exam}
                apply="true"
                onApply={handleApply}
                userAppliedExams={userAppliedExams}
              />
            ))}
          </div>
        );
      case "applications":
        return (
          <div>
            {Array.isArray(applications) && applications.length > 0 ? (
              applications.map((application) => (
                <Exambox
                  key={application._id}
                  exam={application.exam}
                  application="true"
                  status={application.status}
                />
              ))
            ) : (
              <p>No applications found.</p>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <>
      {!authToken ? (
        <>
          {alertMessage && <AlertMessage type="warning" message={alertMessage} />}
        </>
      ) : (
        <>
          {error && <AlertMessage type="danger" message={error} />}
          {applyExam && (
            <AddApplication
              onClose={handleClose}
              onApply={fetchExams}
              exam={applyExam}
              user={user}
            />
          )}
          {ongoingExams.length > 0 && (
            <div className="alert alert-info position-fixed" role="alert">
              You have exams scheduled for today!
            </div>
          )}
          {startedExams.length > 0 && (
            <div className="alert alert-success" role="alert">
              Exams started! Please proceed.
            </div>
          )}
          <Header headtext="User Panel" user="true" />
          <div className="container-fluid p-3 mt-5">
            <div className="d-flex justify-content-between align-items-center">
              <p className="px-4 align-items-center text-light text-start">
                Home Page <i className="fa-solid fa-angle-right"></i>{" "}
                <span>Candidate Dashboard</span>
              </p>
              <button className="btn btn-outline-info btn-sm disable">Edit</button>
            </div>
            <div className="container d-flex bg-light text-dark justify-content-around rounded p-0 my-4">
              <div className="container p-3 align-self-center">
                <h6>{user.name}</h6>
                <h6>Reg. No : {user.registrationNumber}</h6>
              </div>
              <div className="container border p-3 align-self-center">
                <h6>{user.email}</h6>
                <h6>Email ID</h6>
                <br />
                <h6>{user.mobileNumber}</h6>
                <h6>Mobile Number</h6>
              </div>
              <div className="container p-3 align-self-center">
                <h6>{user.address}</h6>
                <h6>Address</h6>
              </div>
            </div>
            <div className="container text-dark">
              {ongoingExams.length > 0 ? (
                <><h6 className="text-bg-light py-2">Ongoing Exams</h6>
                {ongoingExams.map((exam) => (
                  <Exambox
                    key={exam._id}
                    exam={exam}
                    ongoing="true"
                    status={exam.status}
                    user={user}
                  />
                ))}
                </>) : (
                <h6 className="bg-light p-2 text-center">No ongoing exams for today.</h6>
              )}
            </div>
            
            <br />
            <div className="container text-dark">
              <div className="d-flex gap-3">
                <h6
                  className={`p-2 text-center ${activeTab === "live" ? "bg-danger text-light" : "bg-light"}`}
                  onClick={() => setActiveTab("live")}
                >
                  Live Examinations
                </h6>
                <h6
                  className={`p-2 text-center ${activeTab === "applications" ? "bg-danger text-light" : "bg-light"}`}
                  onClick={() => setActiveTab("applications")}
                >
                  My Applications
                </h6>
              </div>
              <div className="text-light">{renderContent()}</div>
            </div>
          </div>
          <br />
          <br />
        </>
      )}
    </>
  );
}; 

export default UserPanel;
