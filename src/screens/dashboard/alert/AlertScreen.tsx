import React from 'react';
import { View, Text, FlatList } from 'react-native';
import { styles } from './alert_style';
import moment from 'moment';

const notifications = [
  {
    id: '1',
    title: 'New Leave Policy',
    description: 'HR has updated the leave policy. Please check.',
    sender: 'HR Department',
    date: moment().subtract(0, 'days').toISOString(),
    viewed: false,
  },
  {
    id: '2',
    title: 'Project Deadline',
    description: 'Reminder: Submit the final report by EOD.',
    sender: 'Project Manager',
    date: moment().subtract(1, 'days').toISOString(),
    viewed: true,
  },
  {
    id: '3',
    title: 'System Maintenance',
    description: 'Server maintenance scheduled for this weekend.',
    sender: 'IT Admin',
    date: moment().subtract(5, 'days').toISOString(),
    viewed: false,
  },
];

const formatDate = dateStr => {
  const date = moment(dateStr);
  if (moment().isSame(date, 'day')) return 'Today';
  if (moment().subtract(1, 'day').isSame(date, 'day')) return 'Yesterday';
  return date.format('MMM DD, YYYY');
};

const NotificationItem = ({ item }) => {
  return (
    <View style={[styles.card, !item.viewed && styles.unreadCard]}>
      <View style={styles.cardHeader}>
        <View style={styles.footer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {item.sender
                .split(' ')
                .map(word => word[0])
                .join('')
                .substring(0, 2)
                .toUpperCase()}
            </Text>
          </View>
        </View>
        <View style={{ width: '64%'}}>
          <Text 
          numberOfLines={1}
          style={styles.cardTitle}>{item.title}</Text>
          <Text 
          numberOfLines={1}
          style={styles.description}>{item.description}</Text>
        </View>
        <View style={{ alignContent: 'flex-end', alignItems: 'flex-end', width: '25%' }}>
          <Text style={styles.dateText}>{formatDate(item.date)}</Text>
          <Text style={styles.timeText}>{moment(item.date).format('hh:mm A')}</Text>
        </View>
      </View>
    </View>
  );
};

const NotificationScreen = () => {
  return (
    <View style={styles.container}>
      <FlatList
        data={notifications}
        keyExtractor={item => item.id}
        renderItem={({ item }) => <NotificationItem item={item} />}
        contentContainerStyle={styles.list}
      />
    </View>
  );
};

export default NotificationScreen;
