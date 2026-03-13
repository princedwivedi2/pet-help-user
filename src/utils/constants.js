export const APPOINTMENT_STATUS = {
  pending: { label: 'Pending', variant: 'warning' },
  accepted: { label: 'Accepted', variant: 'info' },
  rejected: { label: 'Rejected', variant: 'danger' },
  confirmed: { label: 'Confirmed', variant: 'info' },
  in_progress: { label: 'In Progress', variant: 'primary' },
  completed: { label: 'Completed', variant: 'success' },
  cancelled: { label: 'Cancelled', variant: 'danger' },
  cancelled_by_user: { label: 'Cancelled by You', variant: 'danger' },
  cancelled_by_vet: { label: 'Cancelled by Vet', variant: 'danger' },
  no_show: { label: 'No Show', variant: 'default' },
};

export const APPOINTMENT_TYPES = [
  { value: 'online', label: 'Online Consultation' },
  { value: 'clinic_visit', label: 'Clinic Visit' },
  { value: 'home_visit', label: 'Home Visit' },
];

export const SOS_STATUS = {
  pending: { label: 'Pending', variant: 'danger' },
  sos_pending: { label: 'Pending', variant: 'danger' },
  acknowledged: { label: 'Acknowledged', variant: 'warning' },
  sos_accepted: { label: 'Vet Accepted', variant: 'info' },
  vet_on_the_way: { label: 'Vet on the Way', variant: 'info' },
  arrived: { label: 'Vet Arrived', variant: 'primary' },
  in_progress: { label: 'In Progress', variant: 'info' },
  sos_in_progress: { label: 'Treatment In Progress', variant: 'primary' },
  treatment_in_progress: { label: 'Treatment In Progress', variant: 'primary' },
  completed: { label: 'Completed', variant: 'success' },
  sos_completed: { label: 'Completed', variant: 'success' },
  cancelled: { label: 'Cancelled', variant: 'default' },
  sos_cancelled: { label: 'Cancelled', variant: 'default' },
  expired: { label: 'Expired', variant: 'default' },
};

export const PAYMENT_STATUS = {
  pending: { label: 'Pending', variant: 'warning' },
  paid: { label: 'Paid', variant: 'success' },
  failed: { label: 'Failed', variant: 'danger' },
  refunded: { label: 'Refunded', variant: 'info' },
  offline: { label: 'Cash Payment', variant: 'default' },
};

export const PET_SPECIES = [
  { value: 'dog', label: 'Dog' },
  { value: 'cat', label: 'Cat' },
  { value: 'bird', label: 'Bird' },
  { value: 'rabbit', label: 'Rabbit' },
  { value: 'fish', label: 'Fish' },
  { value: 'other', label: 'Other' },
];

export const PET_GENDER = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
];
