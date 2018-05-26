# react-native-yz-vlcplayer

A `<VLCPlayer>` component for react-native  
此项目 参考react-native-video，react-native-vlcplayer, react-native-vlc-player

VLCPlayer 支持各种格式(mp4,m3u8,flv,mov,rtsp,rtmp,etc.)，具体参看[vlc wiki][3]


### Add it to your project

Run `npm install react-native-yz-vlcplayer --save`

## android

Run `react-native link react-native-yz-vlcplayer`

## FullScreen ##
需要用到 `npm install react-native-orientation --save` ，工程配置参看[https://github.com/yamill/react-native-orientation](https://github.com/yamill/react-native-orientation)  

## Static Methods

`seek(seconds)`

```
this.vlcplayer.seek(100); //单位是 ms
```




## Examples

````
   import { VLCPlayer, VlCPlayerView } from 'react-native-yz-vlcplayer';
   import Orientation from 'react-native-orientation';
   
   <VlCPlayerView
       url={this.state.url}           //视屏url
       Orientation={Orientation}      
       //BackHandle={BackHandle}
       ggUrl=""                      // 广告url
       showGG={true}                 // 是否显示广告
       startFullScreen={() => {      
          this.setState({
          isFull: true,
         });
       }}
       closeFullScreen={() => {
          this.setState({
          isFull: false,
         });
       }}
   />
````



**MIT Licensed**
