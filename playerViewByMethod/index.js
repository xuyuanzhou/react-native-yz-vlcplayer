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
} from 'react-native';

import VLCPlayerView from './VLCPlayerView';
import PropTypes from 'prop-types';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { getStatusBarHeight } from './SizeController';
const statusBarHeight = getStatusBarHeight();
const _fullKey = 'commonVideo_android_fullKey';
let deviceHeight = Dimensions.get('window').height;
let deviceWidth = Dimensions.get('window').width;
export default class VlCPlayerViewByMethod extends Component {
  constructor(props) {
    super(props);
    this.url = '';
    this.initialHeight = 211.5;
  }

  static navigationOptions = {
    header: null,
  };

  state = {
    isEndAd: false,
    isFull: false,
    currentUrl: '',
    storeUrl: '',
    isEnding: false,
    isVipPlayEnd: false,
  };

  static defaultProps = {
    height: 250,
    showAd: false,
    adUrl: '',
    url: '',
    showBack: false,
    showTitle: false,
    autoPlayNext: false,
    autoRePlay: false,
    hadNext: false,
    useVip: false,
    vipPlayLength: 180,
    lookTime: 0,
    totalTime: 0,
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
    onStartFullScreen: PropTypes.func,
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
      if (storeUrl === '') {
        return {
          currentUrl: url,
          storeUrl: url,
          isEndAd: false,
          isEnding: false,
          isVipPlayEnd: false,
        };
      } else {
        return {
          currentUrl: '',
          storeUrl: url,
          isEndAd: false,
          isEnding: false,
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
    let { style, isAd } = this.props;

    if (style && style.height && !isNaN(style.height)) {
      this.initialHeight = style.height;
    }
    this.setState({
      currentVideoAspectRatio: deviceWidth + ':' + this.initialHeight,
    });
  }

  componentWillUnmount() {
    let { isFull } = this.props;
    if (isFull) {
      this._onCloseFullScreen();
    }
  }


  stopPlay = ()=>{
    this.vlcPlayerViewRef && this.vlcPlayerViewRef.stop();
    this.vlcPlayerViewAdRef && this.vlcPlayerViewAdRef.stop();
  }

  snapshot = (path)=>{
    this.vlcPlayerViewRef && this.vlcPlayerViewRef.snapshot(path);
    this.vlcPlayerViewAdRef && this.vlcPlayerViewAdRef.snapshot(path);
  }

  _reload = () => {
    let { storeUrl } = this.state;
    this.setState(
      {
        currentUrl: '',
      },
      () => {
        this.setState({
          isEnding: false,
          currentUrl: storeUrl,
        });
      },
    );
  };

  /**
   * 视频播放进度发送变化
   * @param currentTime
   * @param totalTime
   * @private
   */
  _onProgressChange = ({ currentTime, totalTime }) => {
    let { useVip, vipPlayLength, onProgressChange } = this.props;
    if (useVip) {
      if (currentTime >= vipPlayLength) {
        this.vlcPlayerViewRef.stop();
        this.setState({
          isVipPlayEnd: true,
        });
      }
    } else {
      onProgressChange && onProgressChange({ currentTime, totalTime });
    }
  };

  /**
   * 结束全屏
   * @private
   */
  _onCloseFullScreen = () => {
    let { onCloseFullScreen, BackHandle, Orientation } = this.props;
    this.setState({
      isFull: false,
      currentVideoAspectRatio: deviceWidth + ':' + this.initialHeight,
    });
    BackHandle && BackHandle.removeBackFunction(_fullKey);
    Orientation && Orientation.lockToPortrait();
    StatusBar.setHidden(false);
    //StatusBar.setTranslucent(false);
    onCloseFullScreen && onCloseFullScreen();
  };

  /**
   * 全屏
   * @private
   */
  _toFullScreen = () => {
    let { onStartFullScreen, BackHandle, Orientation } = this.props;
    //StatusBar.setTranslucent(true);
    this.setState({ isFull: true, currentVideoAspectRatio: deviceHeight + ':' + deviceWidth });
    StatusBar.setHidden(true);
    BackHandle && BackHandle.addBackFunction(_fullKey, this._onCloseFullScreen);
    onStartFullScreen && onStartFullScreen();
    Orientation && Orientation.lockToLandscape && Orientation.lockToLandscape();
  };

  _onLayout = e => {
    let { width, height } = e.nativeEvent.layout;
    if (width * height > 0) {
      this.width = width;
      this.height = height;
      if (!this.initialHeight) {
        this.initialHeight = height;
      }
    }
  };

  /**
   * 视频播放结束
   * @private
   */
  _onEnd = () => {
    let { autoPlayNext, autoRePlay, hadNext, onEnd } = this.props;
    if (hadNext && autoPlayNext) {
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
    onEnd && onEnd();
  };


  _next = () => {};

  /**
   * 渲染非vip观看结束页面
   * @return {*}
   * @private
   */
  _renderVipView = () => {
    let { isVipPlayEnd, isFull } = this.state;
    let { onCloseFullScreen, onLeftPress, onVipPress } = this.props;
    if (isVipPlayEnd) {
      return (
        <View style={[styles.loading, { backgroundColor: 'rgb(0,0,0)' }]}>
          <View style={{ height: 37, width: '100%' }}>
            <View style={styles.backBtn}>
              <TouchableOpacity
                onPress={() => {
                  if (isFull) {
                    onCloseFullScreen && onCloseFullScreen();
                  } else {
                    onLeftPress && onLeftPress();
                  }
                }}
                style={styles.btn}
                activeOpacity={0.8}>
                <Icon name={'chevron-left'} size={30} color="#fff" />
              </TouchableOpacity>
              {/*<View style={{ flex: 1, marginRight: 10, alignItems:'center', justifyContent:'center' }}>
                <Text style={{ color: '#fff', fontSize: 12 }} numberOfLines={1}>
                  试看结束，请购买后观看
                </Text>
              </View>*/}
            </View>
          </View>
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <View
              style={{
                marginRight: 10,
                marginBottom: 20,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Text style={{ color: '#fff', fontSize: 13 }} numberOfLines={1}>
                试看结束，请购买后观看
              </Text>
            </View>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                onVipPress && onVipPress();
              }}
              style={{
                height: 30,
                width: 80,
                borderRadius: 15,
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: 'rgb(230,33,41)',
              }}>
              <Text style={{ color: '#fff', fontSize: 13 }}>立即购买</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    } else {
      return null;
    }
  };

  render() {
    let {
      url,
      adUrl,
      showAd,
      onAdEnd,
      onEnd,
      style,
      title,
      onLeftPress,
      showBack,
      showTitle,
      onCloseFullScreen,
      videoAspectRatio,
      fullVideoAspectRatio,
      autoPlayNext,
      hadNext,
      chapterElements,
      lookTime,
      totalTime,
    } = this.props;
    let { isEndAd, isFull, currentUrl, isEnding } = this.state;
    let currentVideoAspectRatio = '';
    if (isFull) {
      currentVideoAspectRatio = fullVideoAspectRatio;
    } else {
      currentVideoAspectRatio = videoAspectRatio;
    }
    if (!currentVideoAspectRatio) {
      let { width, height } = this.state;
      currentVideoAspectRatio = this.state.currentVideoAspectRatio;
    }
    let realShowAd = false;
    let type = '';
    let ggType = '';
    let showVideo = false;
    let showTop = false;
    if (showAd && adUrl && !isEndAd && currentUrl) {
      realShowAd = true;
    }
    if (currentUrl) {
      if (!showAd || (showAd && isEndAd)) {
        showVideo = true;
      }
      if (currentUrl.split) {
        let types = currentUrl.split('.');
        if (types && types.length > 0) {
          type = types[types.length - 1];
        }
      }
    }

    if (adUrl && adUrl.split) {
      let types = adUrl.split('.');
      if (types && types.length > 0) {
        ggType = types[types.length - 1];
      }
    }
    if (!showVideo && !realShowAd) {
      showTop = true;
    }
    return (
      <View
        //onLayout={this._onLayout}
        style={[isFull ? styles.container : { height: 211.5 + (Platform.OS === 'ios' ? statusBarHeight : 0), backgroundColor: '#333', marginTop:Platform.OS === 'ios' ? statusBarHeight : 0 }, style]}>
        {!realShowAd &&
          !showVideo && (
            <View style={styles.loading}>
              <ActivityIndicator size={'large'} animating={true} color="#fff" />
            </View>
          )}
        {showTop && (
          <View style={styles.topView}>
            <View style={styles.backBtn}>
              {showBack && (
                <TouchableOpacity
                  onPress={() => {
                    if (isFull) {
                      onCloseFullScreen && onCloseFullScreen();
                    } else {
                      onLeftPress && onLeftPress();
                    }
                  }}
                  style={styles.btn}
                  activeOpacity={0.8}>
                  <Icon name={'chevron-left'} size={30} color="#fff" />
                </TouchableOpacity>
              )}
              <View style={{ flex: 1, marginRight: 10 }}>
                {showTitle && (
                  <Text style={{ color: '#fff', fontSize: 12 }} numberOfLines={1}>
                    {title}
                  </Text>
                )}
              </View>
            </View>
          </View>
        )}
        {realShowAd && (
          <VLCPlayerView
            ref={ref => (this.vlcPlayerViewAdRef = ref)}
            {...this.props}
            videoAspectRatio={currentVideoAspectRatio}
            uri={adUrl}
            source={{ uri: adUrl, type: ggType }}
            type={ggType}
            isAd={true}
            showBack={showBack}
            showTitle={showTitle}
            chapterElements={chapterElements}
            useVip={true}
            vipTime={180}
            isFull={isFull}
            onSnapshot={this.props.onSnapshot}
            onEnd={() => {
              onAdEnd && onAdEnd();
              this.setState({ isEndAd: true });
            }}
            onStartFullScreen={this._toFullScreen}
            onCloseFullScreen={this._onCloseFullScreen}
          />
        )}

        {showVideo && (
          <VLCPlayerView
            ref={ref => (this.vlcPlayerViewRef = ref)}
            {...this.props}
            uri={currentUrl}
            videoAspectRatio={currentVideoAspectRatio}
            onLeftPress={onLeftPress}
            onProgressChange={this._onProgressChange}
            title={title}
            type={type}
            lookTime={lookTime}
            totalTime={totalTime}
            isFull={isFull}
            showBack={showBack}
            showTitle={showTitle}
            hadAd={true}
            onSnapshot={this.props.onSnapshot}
            chapterElements={chapterElements}
            isEndAd={isEndAd}
            //initPaused={this.state.paused}
            style={showAd && !isEndAd ? { position: 'absolute', zIndex: -1 } : {}}
            source={{ uri: currentUrl, type: type }}
            onStartFullScreen={this._toFullScreen}
            onCloseFullScreen={this._onCloseFullScreen}
            onEnd={() => {
              this._onEnd();
            }}
          />
        )}
        {this._renderVipView()}
        {isEnding && (
          <View style={[styles.loading, { backgroundColor: 'rgba(0,0,0,0.3)' }]}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: 10,
              }}>
              <TouchableOpacity
                activeOpacity={1}
                onPress={this._reload}
                style={{
                  width: 60,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <Icon name={'reload'} size={30} color="#fff" />
                <Text style={{ fontSize: 12, color: '#fff' }}>重播</Text>
              </TouchableOpacity>
              {!autoPlayNext &&
                hadNext && (
                  <TouchableOpacity
                    activeOpacity={1}
                    onPress={this._next}
                    style={{
                      width: 60,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                    <Icon name={'skip-next'} size={30} color="#fff" />
                    <Text style={{ fontSize: 12, color: '#fff' }}>下一个</Text>
                  </TouchableOpacity>
                )}
            </View>
          </View>
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
  topView: {
    top: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    left: 0,
    height: 37,
    position: 'absolute',
    width: '100%',
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
});
