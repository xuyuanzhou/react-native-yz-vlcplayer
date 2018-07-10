# react-native-yz-vlcplayer

A `<VLCPlayer>` component for react-native  
此项目 参考[react-native-video](https://github.com/react-native-community/react-native-video)，
[react-native-vlcplayer](https://github.com/xiongchuan86/react-native-vlcplayer), 
[react-native-vlc-player](https://github.com/ghondar/react-native-vlc-player)

VLCPlayer 支持各种格式(mp4,m3u8,flv,mov,rtsp,rtmp,etc.)，具体参看[vlc wiki](https://wiki.videolan.org/Documentation:Documentation/)


### Add it to your project

Run `npm install react-native-yz-vlcplayer --save`


## android

android vlc-sdk 库来源:[https://github.com/mengzhidaren/Vlc-sdk-lib](https://github.com/mengzhidaren/Vlc-sdk-lib)

Run `react-native link react-native-yz-vlcplayer`


## ios

整合 [react-native-vlcplayer](https://github.com/xiongchuan86/react-native-vlcplayer) 而来。

Run `react-native link react-native-yz-vlcplayer`

1.安装MobileVLCKit.framework

(1)在[nightlies.videolan.org/build/iOS/](http://nightlies.videolan.org/build/iOS/) 下载最新版，

(2)在你的项目目录下新建一个 vlcKit 文件夹，并将MobileVLCKit.framework解压到该目录下

(3)在你的工程里面引入MobileVLCKit.framework

   ![](./images/2.png)
   
   ![](./images/3.png)
   
(4)添加 framework search path     `$(PROJECT_DIR)/../vlcKit`
   ![](./images/1.png)
   
(5)Enable Bitcode 设置为no

   Build Settings ---> 查询  Bitcode
   ![](./images/4.png)
   
(6)设置工程deployment target 为 9.3



## FullScreen ##
需要用到 `npm install react-native-orientation --save` ，工程配置参看[https://github.com/yamill/react-native-orientation](https://github.com/yamill/react-native-orientation)  

## Static Methods

`seek(seconds)`

```
android:
    this.vlcplayer.seek(100); // 单位是 ms 
ios:
    this.vlcplayer.seek(0.1); // 0 --- 1 视屏位置进度


this.vlcPlayer.resume(autoplay) //重新加载视屏进行播放,autopaly: true 表示播放 false表示暂停

```

## 回调函数简单说明（目前碰到的）
 ```                                                         支持平台                
           onEnd            视屏播放结束                  ios       android
           onBuffering      正在缓存中                    ios       android
           onError          播放视屏出错                  
           onPlaying        视屏播放                      ios       android
           onPaused         视屏暂停                      ios       android
           onOpen           视屏被打开                              android
           onLoadStart      vlc视屏容器初始化完毕          ios       android
           onProgress       视频进度发送改变               ios       android          swf格式不支持
           
           回调函数出现顺序:  onLoadStart  ---> onOpen 
          
 ```




## Examples    
 
### 版本 0~1.0.6

````
   import { VLCPlayer, VlCPlayerView } from 'react-native-yz-vlcplayer';
   import Orientation from 'react-native-orientation';
   
   //插件参数说明
   (1) 静态方法
       android:
           this.vlcplayer.seek(100); // 单位是 ms 
       ios:
           this.vlcplayer.seek(0.1); // 0 --- 1 视屏位置进度
  （2）
       <VLCPlayer
           ref={ref => (this.vlcPlayer = ref)}
           style={[styles.video]}
           /**
            *  增加视屏宽高比，视屏将按照这个比率拉伸
            */
           videoAspectRatio="16:9"
           /**
            *  是否暂停播放
            */
           paused={this.state.paused}
           /**
            *  资源路径
            *  暂不支持本地资源
            */
           source={{ uri: this.props.uri}}
           /**
            *  进度   
            *  返回 {currentTime:1000,duration:1000} 
            *  单位是 ms
            *  currentTime: 当前时间  
            *  duration:    总时间  
            */
           onProgress={this.onProgress.bind(this)}
           /**
            *  视屏播放结束
            */
           onEnd={this.onEnded.bind(this)}
           /**
            * 正在缓存中
            */
           onBuffering={this.onBuffering.bind(this)}
           onError={this._onError}
           /**
            * 视屏停止
            */
           onStopped={this.onStopped.bind(this)}   
           /**
            * 视屏播放
            */
           onPlaying={this.onPlaying.bind(this)}   
           /**
            * 视屏暂停
            */
           onPaused={this.onPaused.bind(this)}      
       />
   （3）简单例子
       <VlCPlayerView
           autoplay={false}               //视屏播放结束时调用this.vlcPlayer.resume(false)方法
           url={this.state.url}           //视屏url
           Orientation={Orientation}      
           //BackHandle={BackHandle}
           ggUrl=""                      // 广告url
           showGG={true}                 // 是否显示广告
           showTitle={true}              // 是否显示标题
           title=""                      // 标题
           showBack={true}               // 是否显示返回按钮
           onLeftPress={()=>{}}          // 返回按钮点击事件
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

## 版本   1.0.7 ~

````
   import { VLCPlayer, VlCPlayerView } from 'react-native-yz-vlcplayer';
   import Orientation from 'react-native-orientation';
   
   //插件参数说明
   (1) 静态方法
       android:
           this.vlcplayer.seek(100); // 单位是 ms 
       ios:
           this.vlcplayer.seek(0.1); // 0 --- 1 视屏位置进度
  （2）
       <VLCPlayer
           ref={ref => (this.vlcPlayer = ref)}
           style={[styles.video]}
           /**
            *  增加视屏宽高比，视屏将按照这个比率拉伸
            *  不设置按照默认比例
            */
           videoAspectRatio="16:9"  
           /**
            *  是否暂停播放
            */
           paused={this.state.paused}
           /**
            *  资源路径
            *  暂不支持本地资源
            */
           source={{ uri: this.props.uri}}
           /**
            *  进度   
            *  返回 {currentTime:1000,duration:1000} 
            *  单位是 ms
            *  currentTime: 当前时间  
            *  duration:    总时间  
            */
           onProgress={this.onProgress.bind(this)}
           /**
            *  视屏播放结束
            */
           onEnd={this.onEnded.bind(this)}
           /**
            * 正在缓存中
            */
           onBuffering={this.onBuffering.bind(this)}
           /**
            * 播放视屏出错
            */
           onError={this._onError}
           /**
            * 视屏停止
            */
           onStopped={this.onStopped.bind(this)}   
           /**
            * 视屏播放
            */
           onPlaying={this.onPlaying.bind(this)}   
           /**
            * 视屏暂停
            */
           onPaused={this.onPaused.bind(this)}  
           /**
            * 视屏被打开
            /
           onOpen={this._onOpen}
           /**
            * vlc视屏容器初始化完毕
            * 在这里进行设置播放的进度，是否开始播放
            */
           onLoadStart={()=>{
                   if(Platform.OS === 'ios'){
                       this.vlcPlayer.seek(0); //设置播放进度
                   }else{
                       this.vlcPlayer.seek(0); //设置播放的时间
                   }
                   this.setState({
                     paused: true,
                   },()=>{
                     this.setState({
                       paused: false,
                     });
                   })
           }}
       />
   （3）简单例子
       <VlCPlayerView
           autoplay={false}               //视屏播放结束时调用this.vlcPlayer.resume(false)方法
           url={this.state.url}           //视屏url
           Orientation={Orientation}      
           //BackHandle={BackHandle}
           ggUrl=""                      // 广告url
           showGG={false}                 // 是否显示广告
           showTitle={true}              // 是否显示标题
           title=""                      // 标题
           showBack={true}               // 是否显示返回按钮
           onLeftPress={()=>{}}          // 返回按钮点击事件
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
