import AddIcon from '@mui/icons-material/Add';
import MapIcon from '@mui/icons-material/Map';
import ListIcon from '@mui/icons-material/List';
import HistoryIcon from '@mui/icons-material/History';
import BarChartIcon from '@mui/icons-material/BarChart';
import ReportIcon from '@mui/icons-material/Description';
import SettingsIcon from '@mui/icons-material/Settings';
import PeopleIcon from '@mui/icons-material/People';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import WarningIcon from '@mui/icons-material/Warning';
import EditLocationIcon from '@mui/icons-material/EditLocation';
import QRCodeComponent from './components/UserActivities/QRCodeComponent';

export const activityLabels = {
  addZone: "Add New Zone",
  qrCodeComponent: " QR code  ",
  addDevice: "Add New Device",
  addLine: "Add New Line",
  addPost: "Add New Post",
  lampList: "Show Lamp List",
  devicesMap: "Show Zone List",
  
  configureDashboard: "Configure Dashboard",
  history: "History",
  statistics: "Statistics",
  dataReport: "Data Report",
  manageUsers: "Manage Users",
  configureDevices: "Configure Devices",
  configureThresholds: "Configure Thresholds",
};

export const activityIcons = {
  addDevice: <AddIcon />,
  addLine: <AddIcon />,
  addZone: <AddIcon />,
  addPost: <AddIcon />,
  lampList: <ListIcon />,
  devicesMap: <MapIcon />,
  
  qrcode: <PeopleIcon />,
  configureDashboard: <SettingsIcon />,
  history: <HistoryIcon />,
  statistics: <BarChartIcon />,
  dataReport: <ReportIcon />,
  manageUsers: <PeopleIcon />,
  configureDevices: <EditLocationIcon />,
  configureThresholds: <WarningIcon />,
};

// Example of permissions by role
export const pagePermissions = {
  "Regional Director": ["statistics", "history", "dataReport", "manageUsers"],
  Administrator: [
    "statistics",
    "history",
    "addZone",
   
    "addDevice",
    "addLine",
    "addPost",
    "lampList",
    "devicesMap",
    "configureDashboard",
    "statistics",
    "history",
    "dataReport",
    "manageUsers",
    "configureDevices",
    "configureThresholds",
  ],
  "General Doctor": ["statistics", "history", "dataReport", "manageUsers"],
  "Local Director": ["statistics", "history", "dataReport", "manageUsers"],
  Supervisor: ["statistics", "history", "dataReport"],
  Engineer: [
    "statistics",
    "history",
    "addDevice",
    "addLine",
    "addPost",
    "addZone",
    "qrCodeComponent" ,
    "lampList",
    "devicesMap",
    "configureDashboard",
    "statistics",
    "history",
    "dataReport",
    "configureDevices",
    "configureThresholds",
  ],
};
