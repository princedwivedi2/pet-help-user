export const APPOINTMENT_STATUS = {
  pending: { label: 'Pending', variant: 'warning' },
  confirmed: { label: 'Confirmed', variant: 'info' },
  completed: { label: 'Completed', variant: 'success' },
  cancelled: { label: 'Cancelled', variant: 'danger' },
};

export const SOS_STATUS = {
  active: { label: 'Active', variant: 'danger' },
  responding: { label: 'Responding', variant: 'warning' },
  resolved: { label: 'Resolved', variant: 'success' },
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
