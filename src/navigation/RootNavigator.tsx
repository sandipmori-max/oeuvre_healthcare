import React, { useEffect } from 'react';

import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  checkAuthStateThunk,
  getERPMenuThunk,
  getERPDashboardThunk,
} from '../store/slices/auth/thunk';
import DevERPService from '../services/api/deverp';

import AuthNavigator from './AuthNavigator';

import StackNavigator from './StackNavigator';
import FullViewLoader from '../components/loader/FullViewLoader';

const RootNavigator = () => {
  const dispatch = useAppDispatch();
  const { isLoading, isAuthenticated, activeToken } = useAppSelector(state => state.auth);

  useEffect(() => {
    DevERPService.initialize();
    dispatch(checkAuthStateThunk());
  }, [dispatch]);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(getERPMenuThunk());
      dispatch(getERPDashboardThunk());
    }
  }, [isAuthenticated, dispatch, activeToken]);

  if (isLoading) {
    return <FullViewLoader />;
  }

  return isAuthenticated ? <StackNavigator /> : <AuthNavigator />;
};

export default RootNavigator;
