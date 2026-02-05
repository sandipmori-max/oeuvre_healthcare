#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(LocationModule, NSObject)

RCT_EXTERN_METHOD(startService)
RCT_EXTERN_METHOD(stopService)
RCT_EXTERN_METHOD(setUserTokens:(NSArray))

@end
