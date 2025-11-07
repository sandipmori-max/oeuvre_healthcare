import MaterialIcons from '@react-native-vector-icons/material-icons';
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import FastImage from 'react-native-fast-image';
import { ERP_COLOR_CODE } from '../../../../utils/constants';
 
const ProfileSection = ({baseLink, user, onEditPress }) => {
  if (!user) return null; 
  return (
    <TouchableOpacity 
     onPress={onEditPress}
      style={styles.profileContainer}>
      <View style={styles.profileCard}>
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
           <FastImage
                  source={{
                    uri: `${baseLink}/FileUpload/1/UserMaster/${
                      user?.id
                    }/d_profileimage.jpeg?ts=${new Date().getTime()}`,
                    priority: FastImage.priority.normal,
                    cache: FastImage.cacheControl.web,
                  }}
                  style={{ height: 56, width: 56, borderRadius: 46 }}
                />
          </View>

          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user?.name || 'User Name'}</Text>
            <Text style={styles.profileEmail}>{user?.companyName || 'Company'}</Text>
            <View style={styles.roleBadge}>
              <Text style={styles.roleText}>{user?.rolename || 'User Role'}</Text>
            </View>
          </View>

          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.editButton}
            onPress={onEditPress}
          >
            <MaterialIcons name="edit" size={20} color={ERP_COLOR_CODE.ERP_APP_COLOR} />
          </TouchableOpacity>
        </View>

       
      </View>
    </TouchableOpacity>
  );
};

export default ProfileSection;

const styles = StyleSheet.create({
  profileContainer: {
    marginHorizontal: 16,
    marginVertical: 12,
  },
  profileCard: {
    backgroundColor: ERP_COLOR_CODE.ERP_WHITE,
    borderRadius: 16,
    padding: 16,
    borderWidth: 0.6,
    borderColor: ERP_COLOR_CODE.ERP_BORDER_LINE,
    
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    height: 64,
    width: 64,
    borderRadius: 32,
    backgroundColor: ERP_COLOR_CODE.ERP_f0f0f0,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    overflow: 'hidden',
    borderWidth: 1.5,
   },
  profileAvatar: {
    height: '100%',
    width: '100%',
    borderRadius: 32,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '700',
    color: ERP_COLOR_CODE.ERP_222,
  },
  profileEmail: {
    fontSize: 14,
    color: ERP_COLOR_CODE.ERP_666,
    marginVertical: 2,
  },
  roleBadge: {
    backgroundColor: `${ERP_COLOR_CODE.ERP_COLOR}15`,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 4,
    alignSelf: 'flex-start',
  },
  roleText: {
    color: ERP_COLOR_CODE.ERP_APP_COLOR,
    fontSize: 12,
    fontWeight: '600',
  },
  editButton: {
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 0.6,
    borderTopColor: ERP_COLOR_CODE.ERP_f0f0f0,
    marginTop: 14,
    paddingTop: 10,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionText: {
    fontSize: 13,
    color: ERP_COLOR_CODE.ERP_555,
    fontWeight: '500',
  },
});