import { Text, View } from "react-native";
import moment from "moment";

import { styles } from "../alert_style";
import { formatDate } from "../../../../utils/helpers";

export const NotificationItem = ({ item }: any) => {
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