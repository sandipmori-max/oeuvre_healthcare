import React, {useEffect} from 'react';
import {View, ActivityIndicator} from 'react-native';

import {useAppDispatch, useAppSelector} from '../store/hooks';
import { checkAuthStateThunk, getERPMenuThunk, getERPDashboardThunk } from '../store/slices/auth/thunk';
import DevERPService from '../services/api/deverp';

import AuthNavigator from './AuthNavigator';

import StackNavigator from './StackNavigator';
import FullViewLoader from '../components/FullViewLoader';

const RootNavigator = () => {
  const dispatch = useAppDispatch();
  const {
    isLoading,
    isAuthenticated, 
    activeToken
  } = useAppSelector(state => state.auth);

  useEffect(() => {
    DevERPService.initialize();
    dispatch(checkAuthStateThunk());
  }, [dispatch]);

  useEffect(() => {
    console.log("🚀 ~ RootNavigator ~ activeToken-*-*-*-*-*-*-*-*-*-*-*-*:", activeToken)
    if (isAuthenticated) {
      dispatch(getERPMenuThunk());
      dispatch(getERPDashboardThunk());
    }
  }, [isAuthenticated, dispatch, activeToken]);

  if (isLoading) {
    return (
       <FullViewLoader />
    );
  }

  return isAuthenticated ? <StackNavigator /> : <AuthNavigator />;
};

export default RootNavigator;