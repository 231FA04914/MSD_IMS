import { useAlert } from "../contexts/AlertContext";
import "./styles/global.css";

const Alert = () => {
  // Alert component now returns null - all alerts go to notifications page instead
  // This maintains compatibility while disabling popup alerts
  return null;
};

export default Alert;
