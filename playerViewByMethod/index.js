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
  ActivityIndicator,
  Animated,
  NetInfo,
  Image,
  ScrollView
} from 'react-native';

import VLCPlayerView from './VLCPlayerView';
import PropTypes from 'prop-types';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Slider from 'react-native-slider';
import ControlBtn from './ControlBtn';
import TimeLimt from './TimeLimit';
import { getStatusBarHeight } from './SizeController';
const statusBarHeight = getStatusBarHeight();
const _fullKey = 'commonVideo_android_fullKey';
let deviceHeight = Dimensions.get('window').height;
let deviceWidth = Dimensions.get('window').width;

function getWH() {
  return {
    deviceHeight:  Dimensions.get('window').height,
    deviceWidth: Dimensions.get('window').width,
  }
}

const getTime = (data = 0) => {
  let hourCourse = Math.floor(data / 3600);
  let diffCourse = data % 3600;
  let minCourse = Math.floor(diffCourse / 60);
  let secondCourse = Math.floor(diffCourse % 60);
  let courseReal = '';
  if (hourCourse) {
    if (hourCourse < 10) {
      courseReal += '0' + hourCourse + ':';
    } else {
      courseReal += hourCourse + ':';
    }
  }
  if (minCourse < 10) {
    courseReal += '0' + minCourse + ':';
  } else {
    courseReal += minCourse + ':';
  }
  if (secondCourse < 10) {
    courseReal += '0' + secondCourse;
  } else {
    courseReal += secondCourse;
  }
  return courseReal;
};


export default class VlCPlayerViewByMethod extends Component {
  constructor(props) {
    super(props);
    this.url = '';
    this.touchTime = 0;
    this.initialCurrentTime = 0;
    this.initSuccess = false;
    this.initAdLoadStart = false;
  }

  static navigationOptions = {
    header: null,
  };

  state = {
    isEndAd: false,
    isFull: false,
    showControls: false,
    showLoading: true,
    currentUrl: '',
    storeUrl: '',
    showChapter: false,
    isEnding: false,
    isVipPlayEnd: false,
    chapterPosition: new Animated.Value(-250),
    volume: 150,
    muted: false,
    adMuted: false,
    adVolume: 150,
    canShowVideo: true,
  };

  static defaultProps = {
    autoplay: true,
    showAd: false,
    showTop: false,
    adUrl: '',
    url: '',
    showBack: false,
    showTitle: false,
    autoPlayNext: false,
    autoRePlay: false,
    hadNext: false,
    useVip: false,
    vipPlayLength: 180,
    endDiffLength: 5,
    lookTime: 0,
    totalTime: 0,
    initWithFull: false,
    considerStatusBar: false,
    style:{
    },
    fullStyle: {
      position:'absolute',
      width:'100%',
      height:'100%',
      top:0,
      left:0,
      zIndex: 9999,
    },
    initAdType: 2,
    initAdOptions: ["--input-repeat=1000","--repeat"],
    initType: 1,
    initOptions: [],
  };

  static propTypes = {
    /**
     * 视频路径： 本地或者网络
     */
    url: PropTypes.oneOfType([PropTypes.string,PropTypes.object]).isRequired,
    /**
     * 视频样式
     */
    style: PropTypes.object,
    /**
     * 全屏视频样式
     */
    fullStyle: PropTypes.object,
    /**
     * 以全屏初始化
     */
    initWithFull: PropTypes.bool,
    /**
     * 是否使用vip
     */
    useVip: PropTypes.bool,
    /**
     * 非vip观看长度
     */
    vipPlayLength: PropTypes.number,
    /**
     * 是否有下一视频源
     */
    hadNext: PropTypes.bool,
    /**
     * 自动播放下一个视频
     */
    autoPlayNext: PropTypes.bool,
    /**
     * 自动重复播放
     */
    autoRePlay: PropTypes.bool,
    /**
     * 观看时间
     */
    lookTime: PropTypes.number,
    /**
     * 总时间
     */
    totalTime: PropTypes.number,
    /**
     * 是否需要考虑statusBar   only for ios
     */
    considerStatusBar: PropTypes.bool,
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
    onStartFullScreen: PropTypes.func,
    /**
     * 关闭全屏
     */
    onCloseFullScreen: PropTypes.func,

    /**
     * 是否显示顶部
     */
    showTop: PropTypes.bool,
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
        /**
         * 返回按钮点击事件
         */
        onLeftPress: PropTypes.func,
  };

  /*****************************
   *                           *
   *          Lifecycle        *
   *                           *
   *****************************/

  static getDerivedStateFromProps(nextProps, preState) {
    let { url } = nextProps;
    let { currentUrl, storeUrl } = preState;
    if (url && url !== storeUrl) {
      if (storeUrl === '') {
        return {
          currentUrl: url,
          storeUrl: url,
          isEndAd: false,
          isEnding: false,
          isError: false,
          showControls: false,
          showChapter: false,
          isVipPlayEnd: false,
          currentTime: 0,
          totalTime: 0,
        };
      } else {
        return {
          currentUrl: '',
          storeUrl: url,
          currentTime: 0,
          totalTime: 0,
          isEndAd: false,
          isEnding: false,
          isError: false,
          showControls: false,
          showChapter: false,
          isVipPlayEnd: false,
        };
      }
    }
    return null;
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.url !== prevState.storeUrl) {
      this.setState({
        storeUrl: this.props.url,
        currentUrl: this.props.url,
      });
    }
  }

  componentDidMount() {
    let { style, isAd, initWithFull } = this.props;
    NetInfo.getConnectionInfo().then((connectionInfo) => {
      NetInfo.isConnected.fetch().then(isConnected => {
        this.setState({
          netInfo: {
            ...connectionInfo,
            isConnected: isConnected,
          }
        })
      });
    });
    this.checkShowControlInterval = setInterval(this.checkShowControls,1000);
    NetInfo.addEventListener(
      'connectionChange',
      this.handleFirstConnectivityChange
    );

    if(initWithFull){
      this._toFullScreen();
    }
  }

  componentWillUnmount() {
    let { isFull, Orientation } = this.props;
    this.setState({
      canShowVideo: false
    });
    if (isFull) {
      this._onCloseFullScreen();
    }
    if(this.checkShowControlInterval){
      clearInterval(this.checkShowControlInterval);
    }
    NetInfo.removeEventListener(
      'connectionChange',
      this.handleFirstConnectivityChange
    );
    Orientation && Orientation.lockToPortrait();
    StatusBar.setHidden(false);
  }


  /*****************************
   *                           *
   *      network listener     *
   *                           *
   *****************************/

  handleFirstConnectivityChange = (connectionInfo) => {
    NetInfo.isConnected.fetch().then(isConnected => {
      if(isConnected){
        this.play();
      }else{
        this.stopPlay();
      }
      this.setState({
        netInfo: {
          ...connectionInfo,
          isConnected: isConnected,
        }
      })
    });
  }

  _fetchNetWork = ()=>{
    NetInfo.isConnected.fetch().then(isConnected => {
      NetInfo.getConnectionInfo().then((connectionInfo) => {
        if(isConnected){
          this.play();
        }
        this.setState({
          netInfo: {
            ...connectionInfo,
            isConnected: isConnected,
          }
        })
      });
    });
  }


  /*****************************************************************
   *                                                               *
   *                      VLCPlayer  method                        *
   *                                                               *
   *     You can use these  like:                                  *
   *                                                               *
   *    <VLCPlayerView ref={ ref => this.vlcPlayerView = ref }/>   *
   *                                                               *
   *     this.vlcPlayerView.play();                                *
   *                                                               *
   *                                                               *
   *                                                               *
   *****************************************************************/

  pauseAll = ()=>{
    this.vlcPlayerViewRef && this.vlcPlayerViewRef.pause();
    this.vlcPlayerViewAdRef && this.vlcPlayerViewAdRef.pause();
  }

  playAll = ()=>{
    this.vlcPlayerViewRef && this.vlcPlayerViewRef.play();
    this.vlcPlayerViewAdRef && this.vlcPlayerViewAdRef.play();
  }

  /*****************************
   *                           *
   *         video             *
   *                           *
   *****************************/

  play = ()=>{
    this.vlcPlayerViewRef && this.vlcPlayerViewRef.play();
  }

  pause = ()=> {
    this.vlcPlayerViewRef && this.vlcPlayerViewRef.pause();
  }

  seek = (value) => {
    this.vlcPlayerViewRef && this.vlcPlayerViewRef.seek(value);
  }

  pauseToggle = ()=> {
    if(this.state.paused){
      this.vlcPlayerViewRef && this.vlcPlayerViewRef.play();
    }else{
      this.vlcPlayerViewRef && this.vlcPlayerViewRef.pause();
    }
  }

  muteToggle = ()=> {
    if(this.state.muted){
      this.vlcPlayerViewRef && this.vlcPlayerViewRef.muted(false);
      this.setState({
        muted: false
      });
    }else{
      this.vlcPlayerViewRef && this.vlcPlayerViewRef.muted(true);
      this.setState({
        muted: true
      });
    }
  }

  /*****************************
   *                           *
   *     advertise video       *
   *                           *
   *****************************/

  pauseAd = ()=> {
    this.vlcPlayerViewAdRef && this.vlcPlayerViewAdRef.pause();
  }

  playAd = ()=>{
    this.vlcPlayerViewAdRef && this.vlcPlayerViewAdRef.play();
  }

  snapshot = (path)=>{
    this.vlcPlayerViewRef && this.vlcPlayerViewRef.snapshot(path);
    this.vlcPlayerViewAdRef && this.vlcPlayerViewAdRef.snapshot(path);
  }


  seekAd = (value) => {
    this.vlcPlayerViewAdRef && this.vlcPlayerViewAdRef.seek(value);
  }

  pauseAdToggle = ()=> {
    if(this.state.adPaused){
      this.vlcPlayerViewAdRef && this.vlcPlayerViewAdRef.play();
    }else{
      this.vlcPlayerViewAdRef && this.vlcPlayerViewAdRef.pause();
    }
  }

  muteAdToggle = ()=> {
    if (this.state.adMuted) {
      this.vlcPlayerViewAdRef && this.vlcPlayerViewAdRef.muted(false);
      this.setState({
        adMuted: false
      });
    } else {
      this.vlcPlayerViewAdRef && this.vlcPlayerViewAdRef.muted(true);
      this.setState({
        adMuted: true
      });
    }
  }


  /**********************************
   *                                *
   *    VlcPlayerView callback      *
   *                                *
   **********************************/


  /************************
   *                      *
   *         video        *
   *                      *
   ************************/

  _onBuffering = (event) => {
    if(__DEV__){
      //console.log(event);
    }
    let { isPlaying, duration, hasVideoOut} = event;
    if(isPlaying){
       if(duration <= 0){
         this.setState({
           showLoading: false,
           isError: false,
        });
       }else{
         this.setState({
           showLoading: true,
           isError: false,
         });
       }
    }else{
       this.setState({
         showLoading: true,
         isError: false,
       });
    }

  }

  _onIsPlaying = (event)=> {
    let { isPlaying } = event;
    if(isPlaying){
      if(!this.initSuccess){
        this.handleVideoFirstTimePlay();
      }
    }
    this.setState({
      paused: !isPlaying
    })
  }

  /**
   * handle the first time video play
   */
  handleVideoFirstTimePlay = ()=> {
    let { lookTime, totalTime, showAd, autoplay } = this.props;
    let { isEndAd } = this.state;
    this.initSuccess = true;
    if(lookTime && totalTime){
      if (Platform.OS === 'ios') {
        this.seek(Number((lookTime / totalTime).toFixed(17)));
      } else {
        this.seek(lookTime);
      }
    }else{
      this.seek(0);
    }
    this.setState({
      currentTime: lookTime || 0
    })
    if(showAd && !isEndAd){
      this.pause();
    }
    if(!autoplay){
      this.pause();
    }
  }

  /**
   * when video progress is changed
   * @param currentTime
   * @param totalTime
   * @private
   */
  _onProgressChange = ({ currentTime, totalTime }) => {
    if(!this.changingSlider){
      if(totalTime && currentTime){
        this.setState({
          currentTime,
          totalTime,
          showLoading: false,
        });
      }
    }
    //console.log('_onProgressChange:'+currentTime + ","+totalTime)
    let { useVip, vipPlayLength, onProgressChange } = this.props;
    if (useVip) {
      if (currentTime >= vipPlayLength) {
        this.vlcPlayerViewRef.pause();
        this.setState({
          isVipPlayEnd: true,
        });
      }
    } else {
      onProgressChange && onProgressChange({ currentTime, totalTime });
    }
  };

  /**
   *  when video is ended
   * @private
   */
  _onEnd = (data) => {

    if(__DEV__){
      let { url } = this.props;
      console.log(url+' --> end',data);
    }
    let { currentTime, duration} = data;
    let { endDiffLength, onNext, onEnd, hadNext, autoPlayNext, autoRePlay } = this.props;
    if(duration){
      let diff = (duration - currentTime) / 1000;
      if( diff <= endDiffLength){
        if (hadNext && autoPlayNext) {
          onNext && onNext();
        } else if (hadNext && !autoPlayNext) {
          this.setState({
            isEnding: true,
          });
        } else {
          if (autoRePlay) {
            this._reload();
          } else {
            this.setState({
              isEnding: true,
            });
          }
        }
      }else{
          this.setState({
            isError: true,
          });
      }
    }else{
      this.setState({
        isEnding: true,
      });
    }
    onEnd && onEnd(data);
  };

  /**
   * only for android
   * @param e
   * @private
   */
  _onOpen = e => {
    console.log('onOpen',e);
   // console.log(e);
  };


  /**
   * when video  init success
   * @param e
   * @private
   */
  _onLoadStart = e => {
    if(__DEV__){
      let { url } = this.props;
      console.log(url+' --> _onLoadStart',e);
    }
    let { isError, isEndAd } = this.state;
    if (isError) {
        let { currentTime, totalTime } = this.state;
        if (Platform.OS === 'ios') {
          this.seek(Number((currentTime / totalTime).toFixed(17)));
        } else {
          this.seek(currentTime);
        }
        this.setState({
          isError: false,
        });
    } else {
      this.initSuccess = false;
      let { lookTime, totalTime, showAd } = this.props;
      if (lookTime && totalTime) {
        if (Platform.OS === 'ios') {
          this.seek(Number((lookTime / totalTime).toFixed(17)));
        } else {
          this.seek(lookTime);
        }
      } else {
        this.seek(0);
      }
      this.setState({
        showLoading: true,
        isError: false,
        currentTime: lookTime,
        totalTime: totalTime,
      });
    }
  };

  /**
   * when video is stopped
   * @param e
   * @private
   */
  _onStopped = (e)=> {
    if(__DEV__){
      let { url } = this.props;
      console.log(url+' --> _onStopped',e);
    }
    let { showAd } = this.props;
    let { isEndAd, totalTime } = this.state;
    if(showAd && !isEndAd){
      if(totalTime > 0){
        this.setState({
          isEnding: true,
          isEndAd: true,
        })
      }else{
        this.setState({
          isError: true,
          isEndAd: true,
        })
      }
    }else{
      if(totalTime > 0){
        this.setState({
          isEnding: true,
        })
      }else{
        this.setState({
          isError: true,
        })
      }
    }
  }

  _onError = (e) => {
    this.setState({
      isError: true
    })
  }


  /*****************************
   *                           *
   *     advertise video       *
   *                           *
   *****************************/

  _onAdBuffering = e => {
  }

  _onAdIsPlaying = (e)=> {
    let { autoplay } = this.props;
    let { isPlaying } = e;
    if(isPlaying){
      if(!this.initAdSuccess){
        this.initAdSuccess = true;
        this.setState({
          showAdView: true
        });
        if(!autoplay){
          this.pause();
        }
      }
    }
    this.setState({
      adPaused: !isPlaying
    })
  }

  _onAdOpen = (e)=> {

  }

  _onAdStopped = (e)=> {
    this.vlcPlayerViewAdRef && this.vlcPlayerViewAdRef.seek(0);
  }

  _onAdLoadStart = e=> {
    this.initAdSuccess = false;
  }

  _onAdEnd = e => {
    this.vlcPlayerViewAdRef && this.vlcPlayerViewAdRef.seek(0);
  }



  /**********************************************
   *                                            *
   *     method  when video need  reload        *
   *                                            *
   **********************************************/


  reload = () => {
    let { storeUrl } = this.state;
    this.setState(
      {
        currentTime: 0,
        currentUrl: '',
        showControls: false,
      },
      () => {
        this.setState({
          isEnding: false,
          currentUrl: storeUrl,
        });
      },
    );
  };

  reloadCurrent = () => {
    let {storeUrl} = this.state;
    this.setState({currentUrl: '', showControls: false}, () => {
      this.setState({
        isEnding: false,
        currentUrl: storeUrl,
      });
    });
  }

  /**
   * 结束全屏
   * @private
   */
  _onCloseFullScreen = () => {
    let { onCloseFullScreen, BackHandle, Orientation, initWithFull, onLeftPress } = this.props;
    if(initWithFull){
      onLeftPress && onLeftPress();
    }else{
      this.setState({
        isFull: false,
        showControls: false,
      });
      BackHandle && BackHandle.removeBackFunction(_fullKey);
      Orientation && Orientation.lockToPortrait();
      StatusBar.setHidden(false);
      //StatusBar.setTranslucent(false);
      onCloseFullScreen && onCloseFullScreen();
    }

  };

  /**
   * 全屏
   * @private
   */
  _toFullScreen = () => {
    let { onStartFullScreen, BackHandle, Orientation } = this.props;
    //StatusBar.setTranslucent(true);
    this.setState({
      isFull: true,
      showControls: false,
    });
    StatusBar.setHidden(true);
    BackHandle && BackHandle.addBackFunction(_fullKey, this._onCloseFullScreen);
    onStartFullScreen && onStartFullScreen();
    Orientation && Orientation.lockToLandscape && Orientation.lockToLandscape();
  };

  /**
   * 布局发生变化
   * @param e
   * @private
   */
  _onLayout = e => {
    let { width, height } = e.nativeEvent.layout;
    this.setState({
      width,
      height
    })
  };


  _next = () => {
    let { onNext } = this.props;
    onNext && onNext();
  };

  /**
   * 显示章节
   * @private
   */
  _showChapter = () => {
    if (this.showChapter) {
      this._hideChapter();
    } else {
      this.showChapter = true;
      this.setState({
        showChapter: true
      })
      Animated.timing(this.state.chapterPosition, {
        toValue: 0,
        //easing: Easing.back,
        duration: 500,
      }).start();
    }
  };

  /**
   * 隐藏章节
   * @param time
   * @private
   */
  _hideChapter = (time = 250) => {
    this.showChapter = false;
    this.setState({
      showChapter: false
    });
    Animated.timing(this.state.chapterPosition, {
      toValue: -250,
      //easing: Easing.back,
      duration: time,
    }).start();
  };


  _onBodyPress = ()=> {
    let { showControls, showChapter } = this.state;
    if(showChapter){
      this._hideChapter(250);
    }else{
      if(showControls){
        this.setState({ showControls: false });
      }else{
        this.setState({ showControls: true });
      }
    }
    //console.log('_onBodyPress',showControls)
   /* let currentTime = new Date().getTime();
    if (this.touchTime === 0) {
      this.touchTime = currentTime;
      if (showControls) {
        this._hideChapter(0);
      }
      if(showControls){
        this.setState({ showControls: false });
      }else{
        this.setState({ showControls: true });
      }
    } else {
      if (currentTime - this.touchTime >= 500) {
        if (showControls) {
          this._hideChapter(0);
        }
        this.touchTime = currentTime;
        if(showControls){
          this.setState({ showControls: false });
        }else{
          this.setState({ showControls: true });
        }
      }
    }*/
  }

  _onBodyPressIn = ()=>{
    this.touchControlTime = new Date().getTime();
  }

  checkShowControls = ()=> {
    let currentTime = new Date().getTime();
    let { showControls } = this.state;
    if (showControls && (currentTime - this.touchControlTime >= 4000)) {
      /*this.setState({
        showControls: false
      });*/
    }
  }



  _onLeftPress = ()=> {
     let { initWithFull, onLeftPress } = this.props;
     let { isFull } = this.state;
     if (isFull) {
       this._onCloseFullScreen();
     } else {
       onLeftPress && onLeftPress();
     }

  }


  /******************************
   *                            *
   *          UI                *
   *                            *
   ******************************/


  getVipEndView = () => {
    let { onVipPress } = this.props;
      return (
        <View style={[styles.loading, { backgroundColor: 'rgb(0,0,0)' }]}>
          <View style={{ height: 37, width: 40, position:'absolute', top:0, left:0,zIndex: 999 }}>
            <View style={styles.backBtn}>
              <TouchableOpacity onPress={this._onLeftPress} style={styles.btn} activeOpacity={0.8}>
                <Icon name={'chevron-left'} size={30} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.centerContainer}>
            <Text style={styles.centerContainerText} numberOfLines={1}>试看结束，请购买后观看</Text>
            <TouchableOpacity activeOpacity={0.8} onPress={() => {onVipPress && onVipPress()}} style={[styles.centerContainerBtn,{ backgroundColor: 'rgb(230,33,41)'}]}>
              <Text style={styles.centerContainerBtnText}>立即购买</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

  getEndingView = () => {
    let {
      autoPlayNext,
      hadNext,
      showBack
    } = this.props;
    let { height, width } = this.state;
    return(
      <View style={[styles.commonView,{ backgroundColor:'rgba(0,0,0,0)'}]}>
        <View style={styles.centerContainer}>
          <Text style={styles.centerContainerText}>视频播放结束</Text>
          <View style={styles.centerRowContainer}>
            <TouchableOpacity style={styles.centerContainerBtn} onPress={this.reload} activeOpacity={1}>
              <Icon name={'reload'} size={20} color="#fff" />
              <Text style={styles.centerContainerBtnText}>重新播放</Text>
            </TouchableOpacity>
            {!autoPlayNext &&
            hadNext && (<TouchableOpacity style={[styles.centerContainerBtn,{marginLeft:15}]} onPress={this._next} activeOpacity={1}>
              <Icon name={'reload'} size={20} color="#fff" />
              <Text style={styles.centerContainerBtnText}>下一个</Text>
            </TouchableOpacity>)
            }
          </View>
        </View>
        <View style={{ height: 37, width: 40, position:'absolute', top:0, left:0,zIndex: 999 }}>
          {showBack && (
            <TouchableOpacity
              onPress={this._onLeftPress}
              style={styles.btn}
              activeOpacity={0.8}>
              <Icon name={'chevron-left'} size={30} color="#fff" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    )
  }

  getErrorView = ()=> {
    let { showBack, initWithFull, onLeftPress, errorView } = this.props;
    let { netInfo, height, width, isFull, isError } = this.state;
    return (
      <View style={[styles.loading, { zIndex:999, backgroundColor: '#000' }]}>
        <View style={[styles.backBtn,{position:'absolute',left:0,top:0,zIndex:999}]}>
          {showBack && (
            <TouchableOpacity
              onPress={this._onLeftPress}
              style={styles.btn}
              activeOpacity={0.8}>
              <Icon name={'chevron-left'} size={30} color="#fff" />
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.centerContainer}>
          <Text style={styles.centerContainerText}>视频播放出错</Text>
          <TouchableOpacity style={styles.centerContainerBtn} onPress={this.reloadCurrent} activeOpacity={0.8}>
            <Icon name={'reload'} size={20} color="#fff" />
            <Text style={styles.centerContainerBtnText}>重新播放</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
}

  getNoNetInfoView = ()=> {
    let { showBack, initWithFull, onLeftPress } = this.props;
    let { netInfo, height, width, isFull } = this.state;
    let color1 = 'rgba(255,255,255,0.6)';
    let color2 = 'rgba(0,0,0,0.5)';
    return (
        <View
          style={[styles.loading,{zIndex:999, backgroundColor:'#000',}]}>
          <View style={[styles.backBtn,{position:'absolute',left:0,top:0}]}>
            {showBack && (
              <TouchableOpacity
                onPress={this._onLeftPress}
                style={styles.btn}
                activeOpacity={0.8}>
                <Icon name={'chevron-left'} size={30} color="#fff" />
              </TouchableOpacity>
            )}
          </View>
          <View style={styles.centerContainer}>
            <Text style={styles.centerContainerText}>网络未连接，请检查网络设置</Text>
            <TouchableOpacity style={styles.centerContainerBtn} onPress={this._fetchNetWork} activeOpacity={1}>
              <Icon name={'reload'} size={20} color="#fff" />
              <Text style={styles.centerContainerBtnText}>刷新重试</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
  }

  getAdView = ()=> {
    let { onAdEnd, showAd, adUrl, showBack } = this.props;
    let { showAdView, showChapter, isFull, adMuted, adPaused, isEndAd } = this.state;
    return(
      <View style={{position:'absolute',height:'100%',width:'100%',top:0,left:0,zIndex:888,}}>
        {showBack && (
          <TouchableOpacity
            onPress={this._onLeftPress}
            style={[styles.adBtn,{position:'absolute', left: 10, top: 10,}]}
            activeOpacity={0.8}>
            <Icon name={'chevron-left'} size={30} color="#fff" />
          </TouchableOpacity>
        )}
        <View style={[styles.ad,{position:'absolute',right:0,top:10}]}>
          <TimeLimt
            maxTime={30}
            onEnd={()=>{
                this.setState({ isEndAd: true, showAdView:false },()=>{
                  this.play();
                });
                onAdEnd && onAdEnd();
              }}
          />
        </View>
        <TouchableOpacity activeOpacity={1} onPress={this.pauseAdToggle} style={[styles.adBtn,{position:'absolute',left: 10, bottom: 10 }]}>
          <Icon name={adPaused ? 'play' : 'pause'} size={24} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity activeOpacity={1} onPress={this.muteAdToggle} style={[styles.adBtn,{position:'absolute',left: 60, bottom: 10, }]}>
          <Icon name={adMuted ? 'volume-off' : 'volume-high'} size={22} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity activeOpacity={1} onPress={()=>{
              if(isFull){
                this._onCloseFullScreen();
              }else{
                this._toFullScreen();
              }
            }}
                          style={[styles.adBtn,{position:'absolute',right: 10, bottom: 10}]}>
          <Icon name={isFull ? 'fullscreen-exit' : 'fullscreen'} size={26} color="#fff" />
        </TouchableOpacity>
      </View>
    )
  }

  getLoadingView = ()=>{
    let { showBack } = this.props;
    return (<View style={[styles.loading,{zIndex:666}]}>
      <View style={[styles.backBtn,{position:'absolute',left:0,top:0,zIndex:999}]}>
        {showBack && (
          <TouchableOpacity
            onPress={this._onLeftPress}
            style={styles.btn}
            activeOpacity={0.8}>
            <Icon name={'chevron-left'} size={30} color="#fff" />
          </TouchableOpacity>
        )}
      </View>
      <ActivityIndicator size={'large'} animating={true} color="#fff" />
    </View>);
  }

  getCommonView = ()=>{
    let { showBack } = this.props;
    return (<View style={styles.commonView}>
      <TouchableOpacity activeOpacity={1} style={{flex:1}} onPressIn={this._onBodyPressIn} onPressOut={this._onBodyPress}>
      </TouchableOpacity>
      <View style={[styles.backBtn,{position:'absolute',left:0,top:0, zIndex:999}]}>
        {showBack && (
          <TouchableOpacity
            onPress={this._onLeftPress}
            style={styles.btn}
            activeOpacity={0.8}>
            <Icon name={'chevron-left'} size={30} color="#fff" />
          </TouchableOpacity>
        )}
      </View>
    </View>);
  }

  getControlView = ()=> {
    let {
      title,
      onLeftPress,
      showBack,
      showTitle,
      initWithFull,
      showTop,
      onEnd,
      style,
      isAd,
      type,
      showAd,
    } = this.props;
    let {
      muted,
      paused,
      currentTime,
      totalTime,
      isFull,
      showChapter
    } = this.state;
    let doFast = false;
    if (this.initialCurrentTime && this.initialCurrentTime < currentTime) {
      doFast = true;
    }
    let color1 = 'rgba(255,255,255,0.6)';
    let color2 = 'rgba(0,0,0,0.5)';
    return(
      <View style={{position:'absolute',height:'100%',width:'100%',top:0,left:0,zIndex:999,backgroundColor:'rgba(0,0,0,0)'}}>
        <TouchableOpacity activeOpacity={1} style={{flex:1}} onPressIn={this._onBodyPressIn} onPressOut={this._onBodyPress}>
          {
            this.changingSlider &&
              <View style={{flex:1, justifyContent:'center',alignItems:'center'}}>
                <View style={styles.changeSliderView}>
                  <Icon name={doFast ? 'fast-forward' : 'rewind'} size={30} color="#30a935" />
                  <Text style={{ color: '#30a935', fontSize: 11.5 }}>
                    {getTime(currentTime)}
                    <Text style={{color:'#fff'}}>{ '/' + getTime(totalTime)}</Text>
                  </Text>
                </View>
              </View>
          }
        </TouchableOpacity>
        {showTop &&
        <View style={[styles.topView]}>
          <View style={{flex:1, backgroundColor:color1}}>
            <View style={{flex:1, backgroundColor:color2}}>
              <View style={styles.backBtn}>
                {showBack && (
                  <TouchableOpacity
                    onPress={this._onLeftPress}
                    style={styles.btn}
                    activeOpacity={0.8}>
                    <Icon name={'chevron-left'} size={30} color="#fff"/>
                  </TouchableOpacity>
                )}
                <View style={{ justifyContent: 'center', flex: 1, marginRight: 10 }}>
                  {showTitle && (<Text style={{ color: '#fff', fontSize: 12 }} numberOfLines={1}>{title}</Text>)}
                </View>
                {isFull && (
                  <TouchableOpacity
                    style={{
                            width: 40,
                            marginRight: 10,
                            height: '100%',
                            justifyContent: 'center',
                            alignItems: 'center',
                          }}
                    onPress={this._showChapter}
                  >
                    <Text style={{ fontSize: 13, color: this.showChapter ? 'red' : '#fff' }}>章节</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        </View>
        }
        {this.getChapterView()}
        <View style={[styles.bottomView,{}]}>
          <ControlBtn
            showSlider={!isAd}
            muted={muted}
            onMutePress={this.muteToggle}
            paused={paused}
            onReload={this.reloadCurrent}
            onPausedPress={this.pauseToggle}
            onFullPress={()=>{
                if(isFull){
                  this._onCloseFullScreen();
                }else{
                  this._toFullScreen();
                }
              }}
            currentTime={currentTime}
            totalTime={totalTime}
            onValueChange={value => {
                if (!this.changingSlider) {
                  this.initialCurrentTime = currentTime;
                }
                this.changingSlider = true;
                this.setState({
                  currentTime: value,
                });
              }}
            onSlidingComplete={value => {
                this.changingSlider = false;
                this.initialCurrentTime = 0;
                if (Platform.OS === 'ios') {
                  this.seek(Number((value / totalTime).toFixed(17)));
                } else {
                  this.seek(value);
                }
              }}
          />
        </View>
      </View>
    )
  }

  getChapterView = ()=>{
    let { chapterElements } = this.props;
    let { isFull, showChapter, height, chapterPosition } = this.state;
    let color1 = 'rgba(255,255,255,0.6)';
    let color2 = 'rgba(0,0,0,0.5)';
    return(
      <Animated.View
        style={
          [
            styles.chapterView,
            {
                borderTopWidth:     isFull ? 1 : 0,
                borderBottomWidth:  isFull ? 1 : 0,
                right:              chapterPosition,
                height:             isFull ? height - 37 - 37  : 0,
            }
          ]
        }>
        <View style={{flex:1, backgroundColor:color1}}>
          <View style={{flex:1, backgroundColor:color2}}>
            <ScrollView>
              {chapterElements}
            </ScrollView>
          </View>
        </View>
      </Animated.View>
    )
  }


  _renderView = ()=> {
    let {
      title,
      onLeftPress,
      showBack,
      showTitle,
      initWithFull,
      showTop,
      showAd,
      adUrl,
    } = this.props;
    let { isFull, showControls, isEnding, isVipPlayEnd, isError, showChapter, isEndAd, netInfo, currentUrl } = this.state;
    if(isError){
      return this.getErrorView();
    }else if(isEnding){
      return this.getEndingView();
    }else if(isVipPlayEnd){
      return this.getVipEndView();
    }else if(netInfo && netInfo.isConnected === false){
      return this.getNoNetInfoView();
    }
    if(showAd){
      if(adUrl && currentUrl){
        if(!isEndAd){
          return this.getAdView();
        }else{
          if(showControls){
            return this.getControlView();
          }
        }
      }else{
        return this.getLoadingView();
      }
    }else{
      if(!currentUrl){
        return this.getLoadingView();
      }else{
        if(showControls){
          return this.getControlView();
        }
      }
    }
    return this.getCommonView();
  }


  render() {
    let {
      url,
      adUrl,
      showAd,
      showBack,
      style,
      fullStyle,
      autoplay,
      videoAspectRatio,
      fullVideoAspectRatio,
      considerStatusBar,
      initAdType,
      initAdOptions,
      initType,
      initOptions,
    } = this.props;
    let { isEndAd, isFull, currentUrl, isEnding } = this.state;
    /**
     * set videoAspectRatio
     * @type {string}
     */
    let currentVideoAspectRatio = '';//this.state.width + ':' + this.state.height;
    if (isFull) {
      if(fullVideoAspectRatio){
        currentVideoAspectRatio = fullVideoAspectRatio;
      }
    } else {
      if(videoAspectRatio){
        currentVideoAspectRatio = videoAspectRatio;
      }
    }

    /**
     * check video can be play
     * @type {boolean}
     */
    let showVideo = false;
    let realShowAd = false;
    if(showAd){
      if(currentUrl && adUrl){
        realShowAd = true;
        showVideo = true;
        if(isEndAd){
          realShowAd = false;
        }
      }
    }else{
      if(currentUrl){
        showVideo = true;
      }
    }

    /**
     * check if need consider statusbar
     * @type {{}}
     */
    let considerStyle = {};
    if(!isFull && considerStatusBar){
      if(Platform.OS === 'ios'){
        considerStyle = {
          marginTop: statusBarHeight,
        };
      }
    }

    return (
      <View onLayout={this._onLayout} style={[styles.container, considerStyle, isFull ? fullStyle : style]}>
        <View style={{flex:1}}>
          <TouchableOpacity activeOpacity={1} style={{flex:1}} onPressIn={this._onBodyPressIn} onPressOut={this._onBodyPress}>
          {realShowAd && (

            <VLCPlayerView
              ref={ref => (this.vlcPlayerViewAdRef = ref)}
              {...this.props}
              videoAspectRatio={currentVideoAspectRatio}
              url={adUrl}
              //autoplay={autoplay}
              isAd={true}
              onIsPlaying={this._onAdIsPlaying}
              onBuffering={this._onAdBuffering}
              onLoadStart={this._onAdLoadStart}
              onOpen={this._onAdOpen}
              onSnapshot={this.props.onSnapshot}
              onEnd={this._onAdEnd}
              onStopped={this._onAdStopped}
              initOptions={initAdOptions}
              initType={initAdType}
            />
          )}
          {showVideo && (
            <VLCPlayerView
              ref={ref => (this.vlcPlayerViewRef = ref)}
              {...this.props}
              showAd={showAd}
              isAd={false}
              //autoplay={autoplay}
              url={currentUrl}
              isEndAd={isEndAd}
              style={showAd && !isEndAd ? { position: 'absolute', zIndex: -1 } : {}}
              videoAspectRatio={currentVideoAspectRatio}
              onProgressChange={this._onProgressChange}
              onSnapshot={this.props.onSnapshot}
              onIsPlaying={this._onIsPlaying}
              onLoadStart={this._onLoadStart}
              onOpen={this._onOpen}
              onStartFullScreen={this._toFullScreen}
              onCloseFullScreen={this._onCloseFullScreen}
              onBuffering={this._onBuffering}
              onStopped={this._onStopped}
              onError={this._onError}
              onEnd={this._onEnd}
              initOptions={initOptions}
              initType={initType}
            />
          )}
          </TouchableOpacity>
          <View
            style={{position:'absolute',left:0,top:0,width:'100%',height:'100%',backgroundColor:'rgba(0,0,0,0.05)'}}>
          </View>
          {this._renderView()}
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 211.5,
    backgroundColor: '#000',
  },
  style:{

  },
  topView: {
    top: 0,
    backgroundColor: 'rgba(0,0,0,0)',
    left: 0,
    height: 37,
    position: 'absolute',
    width: '100%',
    zIndex: 999,
  },
  backBtn: {
    height: 37,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
  },
  btn: {
    //marginLeft: 10,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
    height: 37,
    width: 40,
  },
  loading: {
    position: 'absolute',
    left: 0,
    top: 0,
    zIndex: 0,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  commonView:{
    position: 'absolute',
    left:0,
    top:0,
    zIndex:999,
    height:'100%',
    width:'100%',
  },
  bottomView: {
    bottom: 0,
    left: 0,
    height: 37,
    zIndex:999,
    position: 'absolute',
    width: '100%',
    backgroundColor: 'rgba(0,0,0,0)',
  },
  ad: {
    backgroundColor: 'rgba(255,255,255,1)',
    height: 30,
    marginRight: 10,
    paddingLeft: 10,
    paddingRight: 10,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chapterView: {
    borderColor: '#000',
    top: 37,
    backgroundColor: 'rgba(0,0,0,0)',
    position: 'absolute',
    width: 220,
    zIndex: 999,
  },
  centerContainer: {
    flex:1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerRowContainer:{
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection:'row',
  },
  centerContainerText: {
    fontSize:12,
    color:'#fff'
  },
  centerContainerBtn: {
    marginTop:20,
    width:100,
    height:30,
    borderRadius:15,
    flexDirection:'row',
    justifyContent:'center',
    alignItems:'center',
    backgroundColor:'#30a935'
  },
  centerContainerBtnText:{
    marginLeft:5,
    fontSize:11,
    color:'#fff'
  },
  changeSliderView: {
    width: 95,
    height: 58.5,
    borderRadius: 3,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  adBtn:{
    backgroundColor:'rgba(0,0,0,0.3)',
    borderRadius:15,
    width: 30,
    height:30,
    position:'absolute',
    alignItems: 'center',
    justifyContent: 'center'
  },
});
