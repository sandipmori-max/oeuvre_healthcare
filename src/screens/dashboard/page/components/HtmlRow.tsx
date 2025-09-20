import React from 'react';
import { useWindowDimensions, View } from 'react-native';
import RenderHtml from 'react-native-render-html';

const HtmlRow = ({ item }: any) => {
  const { width } = useWindowDimensions();
  const source = {
    html: `
<p style='text-align:center;'>
  Hello World!
</p>`,
  };

  return (
    <View style={{ marginVertical: 8 }}>
      <RenderHtml contentWidth={width} source={source} />
    </View>
  );
};

export default HtmlRow;
