import * as Yup from 'yup';

export const erp_add_account_validation_schema = Yup.object().shape({
  company_code: Yup.string().required('Company code is required'),
  user: Yup.string().required('User name is required'),
  password: Yup.string().required('Password is required'),
});