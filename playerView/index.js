/**
 * Created by yuanzhou.xu on 2018/5/15.
 */

import React, { Component } from 'react';
import {
  StatusBar,
  View,
  StyleSheet,
  Platform,
  TouchableOpacity,
  Text,
  Dimensions,
  BackHandler,
} from 'react-native';

import VLCPlayerView from './VLCPlayerView';
import PropTypes from 'prop-types';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {getStatusBarHeight}  from './SizeController';
const statusBarHeight = getStatusBarHeight();
const _fullKey = 'commonVideo_android_fullKey';
let deviceHeight = Dimensions.get('window').height;
let deviceWidth = Dimensions.get('window').width;
export default class CommonVideo extends Component {
  constructor(props) {
    super(props);
    this.url = '';
    this.initialHeight = 200;
  }

  static navigationOptions = {
    header: null,
  };

  state = {
    isEndAd: false,
    isFull: false,
    currentUrl: '',
    storeUrl: '',
  };

  static defaultProps = {
    height: 250,
    showAd: false,
    adUrl: '',
    url: '',
    showBack: false,
    showTitle: false,
  };

  static propTypes = {
    /**
     * 视频播放结束
     */
    onEnd: PropTypes.func,

    /**
     * 广告头播放结束
     */
    onAdEnd: PropTypes.func,
    /**
     * 开启全屏
     */
    startFullScreen: PropTypes.func,
    /**
     * 关闭全屏
     */
    closeFullScreen: PropTypes.func,
    /**
     * 返回按钮点击事件
     */
    onLeftPress: PropTypes.func,
    /**
     * 标题
     */
    title: PropTypes.string,
    /**
     * 是否显示返回按钮
     */
    showBack: PropTypes.bool,
    /**
     * 是否显示标题
     */
    showTitle: PropTypes.bool,
  };

  static getDerivedStateFromProps(nextProps, preState) {
    let { url } = nextProps;
    let { currentUrl, storeUrl } = preState;
    if (url && url !== storeUrl) {
      if(storeUrl === ""){
        return {
          currentUrl: url,
          storeUrl: url,
          isEndAd: false,
        };
      }else{
        return {
          currentUrl: "",
          storeUrl: url,
          isEndAd: false,
        };
      }
    }
    return null;
  }


  componentDidUpdate(prevProps, prevState) {
    if (this.props.url !== prevState.storeUrl) {
      this.setState({
        storeUrl: this.props.url,
        currentUrl: this.props.url
      })
    }
  }

  componentDidMount(){
    StatusBar.setBarStyle("light-content");
    let { style, isAd } = this.props;

    if(style && style.height && !isNaN(style.height)){
      this.initialHeight = style.height;
    }
    this.setState({
      currentVideoAspectRatio: deviceWidth + ":" + this.initialHeight,
    });
  }

  componentWillUnmount() {
    let { isFull } = this.props;
    if (isFull) {
      this._closeFullScreen();
    }
  }

  _closeFullScreen = () => {
    let { closeFullScreen, BackHandle, Orientation } = this.props;
    this.setState({ isFull: false, currentVideoAspectRatio: deviceWidth + ":" + this.initialHeight, });
    BackHandle && BackHandle.removeBackFunction(_fullKey);
    Orientation && Orientation.lockToPortrait();
    StatusBar.setHidden(false);
    //StatusBar.setTranslucent(false);
    closeFullScreen && closeFullScreen();
  };

  _toFullScreen = () => {
    let { startFullScreen, BackHandle, Orientation } = this.props;
    //StatusBar.setTranslucent(true);
    this.setState({ isFull: true, currentVideoAspectRatio: deviceHeight + ":" + deviceWidth,});
    StatusBar.setHidden(true);
    BackHandle && BackHandle.addBackFunction(_fullKey, this._closeFullScreen);
    startFullScreen && startFullScreen();
    Orientation && Orientation.lockToLandscape && Orientation.lockToLandscape();
  };

  _onLayout = (e)=>{
    let {width, height} = e.nativeEvent.layout;
    console.log(e.nativeEvent.layout);
    if(width * height > 0){
      this.width = width;
      this.height = height;
      if(!this.initialHeight){
        this.initialHeight = height;
      }
    }
  }



  render() {
    let { url, adUrl, showAd, onAdEnd, onEnd, style, height, title, onLeftPress, showBack, showTitle,closeFullScreen, videoAspectRatio, fullVideoAspectRatio } = this.props;
    let { isEndAd, isFull, currentUrl } = this.state;
    let currentVideoAspectRatio = '';
    if(isFull){
      currentVideoAspectRatio = fullVideoAspectRatio;
    }else{
      currentVideoAspectRatio = videoAspectRatio;
    }
    if(!currentVideoAspectRatio){
      let { width, height} = this.state;
      currentVideoAspectRatio = this.state.currentVideoAspectRatio;
    }
    let realShowAd = false;
    let type = '';
    let adType = '';
    let showVideo = false;
    let showTop = false;
    if (showAd && adUrl && !isEndAd) {
      realShowAd = true;
    }
    if (currentUrl) {
      if(!showAd || (showAd && isEndAd)){
        showVideo = true;
      }
      if(currentUrl.split){
        let types = currentUrl.split('.');
        if (types && types.length > 0) {
          type = types[types.length - 1];
        }
      }
    }
    if (adUrl && adUrl.split) {
      let types = adUrl.split('.');
      if (types && types.length > 0) {
        adType = types[types.length - 1];
      }
    }
    if(!showVideo && !realShowAd){
      showTop = true;
    }
    return (
      <View
        //onLayout={this._onLayout}
        style={[isFull ? styles.container : { height: 200, backgroundColor: '#000' }, style]}>
        {showTop && <View style={styles.topView}>
          <View style={styles.backBtn}>
            {showBack && <TouchableOpacity
              onPress={()=>{
                if(isFull){
                  closeFullScreen && closeFullScreen();
                }else{
                  onLeftPress && onLeftPress();
                }
              }}
              style={styles.btn}
              activeOpacity={0.8}>
              <Icon name={'chevron-left'} size={30} color="#fff"/>
            </TouchableOpacity>
            }
            <View style={{justifyContent:'center',flex:1, marginRight: 10}}>
              {showTitle &&
              <Text style={{color:'#fff', fontSize: 16}} numberOfLines={1}>{title}</Text>
              }
            </View>
          </View>
        </View>
        }
        {realShowAd && (
          <VLCPlayerView
            {...this.props}
            videoAspectRatio={currentVideoAspectRatio}
            uri={adUrl}
            source={{ uri: adUrl, type: adType }}
            type={adType}
            isAd={true}
            showBack={showBack}
            showTitle={showTitle}
            isFull={isFull}
            onEnd={() => {
              onAdEnd && onAdEnd();
              this.setState({ isEndAd: true });
            }}
            startFullScreen={this._toFullScreen}
            closeFullScreen={this._closeFullScreen}
          />
        )}

        {showVideo && (
          <VLCPlayerView
            {...this.props}
            uri={currentUrl}
            videoAspectRatio={currentVideoAspectRatio}
            onLeftPress={onLeftPress}
            title={title}
            type={type}
            isFull={isFull}
            showBack={showBack}
            showTitle={showTitle}
            hadAd={true}
            isEndAd={isEndAd}
            //initPaused={this.state.paused}
            style={showAd && !isEndAd ? { position: 'absolute', zIndex: -1 } : {}}
            source={{ uri: currentUrl, type: type }}
            startFullScreen={this._toFullScreen}
            closeFullScreen={this._closeFullScreen}
            onEnd={() => {
              onEnd && onEnd();
            }}
          />
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  topView:{
    top:Platform.OS === 'ios' ? statusBarHeight: 0,
    left:0,
    height:45,
    position:'absolute',
    width:'100%'
  },
  backBtn:{
    height:45,
    width:'100%',
    flexDirection:'row',
    alignItems:'center'
  },
  btn:{
    marginLeft:10,
    marginRight:10,
    justifyContent:'center',
    alignItems:'center',
    backgroundColor:'rgba(0,0,0,0.1)',
    height:40,
    borderRadius:20,
    width:40,
  }
});
