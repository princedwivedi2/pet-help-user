import api from './api';

const visitRecordService = {
  getForAppointment: (uuid) => api.get(`/visit-records/appointment/${uuid}`),
  getForSos: (uuid) => api.get(`/visit-records/sos/${uuid}`),
};

export default visitRecordService;
