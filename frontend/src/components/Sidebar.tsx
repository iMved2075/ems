import * as React from 'react';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import InboxIcon from '@mui/icons-material/MoveToInbox';
import MailIcon from '@mui/icons-material/Mail';
import { AccountBox, People, Apartment, BarChart, Delete, Build, FolderShared } from '@mui/icons-material';
import type { EmployeeRole } from '../types/employee';

interface SidebarProps {
  text?: string;
  icon?: React.ReactNode;
  link?: string;
}

type AppSidebarProps = {
  role: EmployeeRole;
};

const itemsByRole: Record<EmployeeRole, SidebarProps[]> = {
  super_admin: [
    { text: 'Overview', icon: <AccountBox />, link: '#overview' },
    { text: 'Create Employee', icon: <People />, link: '#create-employee' },
    { text: 'Update Employee', icon: <Build />, link: '#update-employee' },
    { text: 'Delete Employee', icon: <Delete />, link: '#delete-employee' },
    { text: 'Filters', icon: <BarChart />, link: '#filters' },
    { text: 'Organization Chart', icon: <Apartment />, link: '#organization-chart' },
    { text: 'My Profile', icon: <FolderShared />, link: '#my-profile' },
  ],
  hr_manager: [
    { text: 'Overview', icon: <AccountBox />, link: '#overview' },
    { text: 'Create Employee', icon: <People />, link: '#create-employee' },
    { text: 'Update Employee', icon: <Build />, link: '#update-employee' },
    { text: 'Filters', icon: <BarChart />, link: '#filters' },
    { text: 'Organization Chart', icon: <Apartment />, link: '#organization-chart' },
    { text: 'My Profile', icon: <FolderShared />, link: '#my-profile' },
  ],
  employee: [
    { text: 'Overview', icon: <AccountBox />, link: '#overview' },
    { text: 'Self Update', icon: <Build />, link: '#self-update' },
    { text: 'My Profile', icon: <FolderShared />, link: '#my-profile' },
  ],
};

export default function Sidebar({ role }: AppSidebarProps) {
//   const [open, setOpen] = React.useState(false);
//   const [open, setOpen] = useState(false);


//   const toggleDrawer = (newOpen: boolean) => () => {
//     setOpen(newOpen);
//   };

    const listItems = itemsByRole[role] ?? itemsByRole.employee;

  const MenuOptions = (
    <Box sx={{ width: 250 }} role="presentation" className="sidebar bg-(--background-color) text-(--text-color) border-r h-screen">
      <List>
        {listItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton component="a" href={item.link as string}>
              <ListItemIcon className="invert-(--icon-invert)">
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider />
      <List>
        {['All mail', 'Trash', 'Spam'].map((text, index) => (
          <ListItem key={text} disablePadding>
            <ListItemButton>
              <ListItemIcon>
                {index % 2 === 0 ? <InboxIcon /> : <MailIcon />}
              </ListItemIcon>
              <ListItemText primary={text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <div>
      {/* <Button >Open drawer</Button> */}
      {MenuOptions}
    </div>
  );
}
