import React from 'react';
import { useWindowDimensions } from 'react-native';
import RenderHtml from 'react-native-render-html';

const HtmlRow = ({ item }: any) => {
  const { width } = useWindowDimensions();
  const source = {
    html: `
<p style='text-align:center;'>
  Hello World!
</p>`,
  };

  return <RenderHtml contentWidth={width} source={source} />;
};

export default HtmlRow;
