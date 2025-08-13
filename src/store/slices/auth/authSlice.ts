import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {AuthState, MenuItem, DashboardItem } from './type';
import {checkAuthStateThunk, loginUserThunk, removeAccountThunk, switchAccountThunk, logoutUserThunk, getERPMenuThunk, getERPDashboardThunk } from './thunk';

// Initial state
const initialState: AuthState = {
  user: null,
  accounts: [],
  activeAccountId: null,
  isLoading: true,
  isAuthenticated: false,
  error: null,
  menu: [],
  isMenuLoading: false,
  dashboard: [],
  isDashboardLoading: false,
  activeToken: null,
};

// Auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: state => {
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
     logout: state => {
       state.user = null;
       state.accounts = [];
       state.activeAccountId = null;
       state.isAuthenticated = false;
       state.error = null;
       state.menu = [];
       state.dashboard = [];
     },
    setMenu: (state, action: PayloadAction<MenuItem[]>) => {
      state.menu = action.payload;
    },
    setMenuLoading: (state, action: PayloadAction<boolean>) => {
      state.isMenuLoading = action.payload;
    },
    setDashboard: (state, action: PayloadAction<DashboardItem[]>) => {
      state.dashboard = action.payload;
    },
    setDashboardLoading: (state, action: PayloadAction<boolean>) => {
      state.isDashboardLoading = action.payload;
    },
    setActiveToken: (state, action: PayloadAction<string | null>) => {
      state.activeToken = action.payload;
    }
  },
  extraReducers: builder => {
    builder

      // Check auth state
      .addCase(checkAuthStateThunk.pending, state => {
        state.isLoading = true;
      })
      .addCase(checkAuthStateThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload) {
          state.accounts = action?.payload?.accounts;
          state.activeAccountId = action?.payload?.activeAccountId;
          state.user = action?.payload?.user;
          state.activeToken = action?.payload?.user?.token || null;
          state.isAuthenticated = !!action?.payload?.user;
        }
        state.error = null;
      })
      .addCase(checkAuthStateThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.error = action?.payload as string;
      })

      // Login user
      .addCase(loginUserThunk.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUserThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action?.payload?.user;
        state.activeAccountId = action?.payload?.accountId;
        if (action?.payload?.accounts) {
          state.accounts = action?.payload?.accounts;
        } else {
          state.accounts = state?.accounts.map(acc => ({
            ...acc,
            isActive: acc?.id === action?.payload?.accountId,
          }));
        }
        state.isAuthenticated = true;
        state.activeToken = action?.payload?.user?.token || null;

        state.error = null;
      })
      .addCase(loginUserThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.error = action.payload as string;
      })
      
      // Switch account
      .addCase(switchAccountThunk.pending, state => {
        state.isLoading = true;
      })
      .addCase(switchAccountThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action?.payload?.user;
        state.activeAccountId = action?.payload?.accountId;
        state.accounts = action?.payload?.accounts;
        console.log("🚀 ~ action-------->:", action?.payload?.user )
        state.activeToken = action?.payload?.user?.token || null;

        state.error = null;
      })
      .addCase(switchAccountThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action?.payload as string;
      })

      // Remove account
      .addCase(removeAccountThunk.pending, state => {
        state.isLoading = true;
      })
      .addCase(removeAccountThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.accounts = action?.payload?.accounts;
        state.user = action?.payload?.user;
        state.activeAccountId = action?.payload?.activeAccountId;
        state.isAuthenticated = !!action?.payload?.user;
        state.activeToken = action?.payload?.user?.token || null;
        state.error = null;
      })
      .addCase(removeAccountThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action?.payload as string;
      })

      // Logout user
      .addCase(logoutUserThunk.fulfilled, (state) => {
        state.isLoading = false;
        state.user = null;
        state.accounts = [];
        state.activeAccountId = null;
        state.isAuthenticated = false;
        state.error = null;
        state.menu = [];
        state.dashboard = [];
        state.activeToken = null;
      })
      .addCase(logoutUserThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action?.payload as string;
      })

      // Get ERP Menu
      .addCase(getERPMenuThunk.pending, (state) => {
        state.isMenuLoading = true;
      })
      .addCase(getERPMenuThunk.fulfilled, (state, action) => {
        state.isMenuLoading = false;
        console.log('🚀 ~ getERPMenuThunk.fulfilled ~ action.payload:', action.payload);
        console.log('🚀 ~ action.payload type:', typeof action.payload);
        
        // Parse the menu data from the API response structure
        try {
          let menuData;
          if (typeof action.payload === 'string') {
            // If it's a string, try to parse it
            console.log('🚀 ~ Parsing string payload...');
            menuData = JSON.parse(action.payload);
          } else {
            // If it's already an object, use it directly
            console.log('🚀 ~ Using object payload directly...');
            menuData = action.payload;
          }
          
          console.log('🚀 ~ parsed menuData:', menuData);
          
          // Extract menus from the response
          let menus = [];
          if (menuData) {
            if (menuData.success === 1 && menuData.menus) {
              // Direct access to menus array
              console.log('🚀 ~ Direct access to menus:', menuData.menus.length);
              menus = menuData.menus;
            } else if (menuData.d) {
              // Parse the inner d property which contains the actual menu data
              try {
                console.log('🚀 ~ Attempting to parse inner d property...');
                const innerData = JSON.parse(menuData.d);
                console.log('🚀 ~ innerData:', innerData);
                if (innerData?.success === 1 && innerData?.menus) {
                  menus = innerData.menus;
                  console.log('🚀 ~ Successfully extracted menus from d property:', menus.length);
                }
              } catch (innerParseError) {
                console.error('Error parsing inner d property:', innerParseError);
                console.log('Raw d property value:', menuData.d);
              }
            }
          }
          
          console.log('🚀 ~ extracted menus:', menus);
          console.log('🚀 ~ menus length:', menus.length);
          
          // Convert the API menu structure to our MenuItem interface
          state.menu = menus.map((menu: any, index: number) => ({
            id: menu.Link || `menu_${index}`,
            name: menu.Name || '',
            url: menu.Link || '',
            icon: menu.Data || '',
            children: menu.Datas || [],
            title: menu.Title || '',
            isReport: menu.IsReport === '1'
          }));
          
          console.log('🚀 ~ final state.menu:', state.menu);
          
        } catch (error) {
          console.error('Error parsing menu data:', error);
          console.log('Raw menu payload:', action.payload);
          console.log('Raw menu payload type:', typeof action.payload);
          state.menu = [];
        }
      })
             .addCase(getERPMenuThunk.rejected, (state, action) => {
         state.isMenuLoading = false;
         state.error = action.payload as string;
       })

       // Get ERP Dashboard
       .addCase(getERPDashboardThunk.pending, (state) => {
         state.isDashboardLoading = true;
       })
               .addCase(getERPDashboardThunk.fulfilled, (state, action) => {
          state.isDashboardLoading = false;
          console.log('🚀 ~ getERPDashboardThunk.fulfilled ~ action.payload:', action.payload);
          
          try {
            let dashboardData;
            if (typeof action.payload === 'string') {
              dashboardData = JSON.parse(action.payload);
            } else {
              dashboardData = action.payload;
            }
            
            console.log('🚀 ~ parsed dashboardData:', dashboardData);
            
            let dashboardItems = [];
            
            // Handle the nested structure: data.d contains the stringified JSON
            if (dashboardData.data && dashboardData.data.d) {
              try {
                console.log('🚀 ~ Attempting to parse data.d property...');
                const innerData = JSON.parse(dashboardData.data.d);
                console.log('🚀 ~ innerData from data.d:', innerData);
                if (innerData?.success === 1 && innerData?.dbs) {
                  dashboardItems = innerData.dbs;
                  console.log('🚀 ~ Successfully extracted dbs from data.d property:', dashboardItems.length);
                }
              } catch (innerParseError) {
                console.error('Error parsing data.d property:', innerParseError);
                console.log('Raw data.d value:', dashboardData.data.d);
              }
            } else if (dashboardData.success === 1 && dashboardData.dbs) {
              // Direct access to dbs array (fallback)
              console.log('🚀 ~ Direct access to dbs:', dashboardData.dbs.length);
              dashboardItems = dashboardData.dbs;
            } else if (dashboardData.d) {
              // Parse the inner d property (another fallback)
              try {
                const innerData = JSON.parse(dashboardData.d);
                console.log('🚀 ~ innerData from d:', innerData);
                if (innerData?.success === 1 && innerData?.dbs) {
                  dashboardItems = innerData.dbs;
                  console.log('🚀 ~ Successfully extracted dbs from d property:', dashboardItems.length);
                }
              } catch (innerParseError) {
                console.error('Error parsing inner d property:', innerParseError);
              }
            }
            
            console.log('🚀 ~ extracted dashboardItems:', dashboardItems);
            
            // Convert to DashboardItem interface
            state.dashboard = dashboardItems.map((item: any, index: number) => ({
              id: item.Link || `dashboard_${index}`,
              name: item.Name || '',
              data: item.Data || '',
              url: item.Link || '',
              title: item.Title || '',
              isReport: item.IsReport === '1' || item.IsReport === '2'
            }));
            
            console.log('🚀 ~ final state.dashboard:', state.dashboard);
            
          } catch (error) {
            console.error('Error parsing dashboard data:', error);
            console.log('Raw dashboard payload:', action.payload);
            console.log('Raw dashboard payload type:', typeof action.payload);
            state.dashboard = [];
          }
        })
       .addCase(getERPDashboardThunk.rejected, (state, action) => {
         state.isDashboardLoading = false;
         state.error = action.payload as string;
       })
   },
 });

export const {clearError, setLoading, logout, setMenu, setMenuLoading, setDashboard, setDashboardLoading, setActiveToken} = authSlice.actions;
export default authSlice.reducer;