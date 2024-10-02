// src/components/Notifications.jsx
import React, { useEffect } from 'react';
import { toast } from 'react-toastify';

const Notifications = ({ events }) => {
  useEffect(() => {
    events.forEach((event) => {
      toast.info(event.message);
    });
  }, [events]);

  return null;
};

export default Notifications;
