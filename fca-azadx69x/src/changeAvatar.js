// fixed by @Azadx69x
"use strict";

const log = require("npmlog");
const utils = require("../utils");
const { isReadableStream, parseAndCheckLogin, getType } = utils;

module.exports = function(defaultFuncs, api, ctx) {
  
  
  function getDtsg() {
    return ctx.fb_dtsg || ctx.globalOptions.fb_dtsg || "";
  }

  
  function generateJazoest(fbDtsg) {
    if (!fbDtsg) return "";
    let hash = 0;
    for (let i = 0; i < fbDtsg.length; i++) {
      hash = ((hash << 5) - hash) + fbDtsg.charCodeAt(i);
      hash = hash & hash;
    }
    return Math.abs(hash).toString();
  }

  
  async function uploadImage(image, callback) {
    try {
      
      let imageBuffer;
      if (isReadableStream(image)) {
        const chunks = [];
        for await (const chunk of image) {
          chunks.push(chunk);
        }
        imageBuffer = Buffer.concat(chunks);
      } else if (Buffer.isBuffer(image)) {
        imageBuffer = image;
      } else {
        throw new Error("Image must be a readable stream or Buffer");
      }

      
      const uploadForm = {
        av: ctx.userID,
        fb_dtsg: getDtsg(),
        jazoest: generateJazoest(getDtsg()),
        __a: 1,
        __req: "1a",
        __hs: "19534.HYP:comet_pkg.2.1..2.1",
        dpr: 1,
        __ccg: "EXCELLENT",
        __rev: 1006173360,
        __s: "q9f4j2:2o8n7a:6go9y8",
        __hsi: Date.now().toString(),
        __dyn: "7AzHJ4zamaUmgDxqheC1swgE98nwgU6C7UW3qiFwKwPxe3q2ibwNwnof8boG4E6KewXzobohwJwpUe8hohg2eUmC3-V8jK5o4e2CGwEwt86C2q1iwhE2Lwwwg8E2Yx60F9omwn82ywFE5S0IUux62G5UfE31mVEtwEwHw",
        __csr: "",
        __comet_req: 15,
        fb_api_caller_class: "RelayModern",
        fb_api_req_friendly_name: "ProfileCometProfilePictureUploadMutation",
        variables: JSON.stringify({
          input: {
            actor_id: ctx.userID,
            client_mutation_id: Math.round(Math.random() * 1000000).toString(),
            image: {
              height: 720,
              width: 720,
              photo_source: 57,
              data: {
                data: imageBuffer.toString('base64'),
                length: imageBuffer.length,
                name: "profile.jpg",
                type: "image/jpeg"
              }
            },
            profile_id: ctx.userID,
            scale: 3,
            source: "TIMELINE"
          }
        }),
        server_timestamps: true,
        doc_id: "5066134240065849"
      };

      const uploadRes = await defaultFuncs.post(
        "https://www.facebook.com/api/graphql/",
        ctx.jar,
        uploadForm
      ).then(parseAndCheckLogin(ctx, defaultFuncs));

      
      if (uploadRes.errors && uploadRes.errors.length > 0) {
        throw new Error(uploadRes.errors[0].message || "Upload failed");
      }

      if (uploadRes.error) {
        throw new Error(uploadRes.error.message || uploadRes.error);
      }

      
      let photoId = null;
      if (uploadRes.data && uploadRes.data.profile_picture_upload) {
        photoId = uploadRes.data.profile_picture_upload.photo.id;
      } else if (uploadRes[0] && uploadRes[0].data && uploadRes[0].data.profile_picture_upload) {
        photoId = uploadRes[0].data.profile_picture_upload.photo.id;
      } else if (uploadRes.payload && uploadRes.payload.fbid) {
        
        photoId = uploadRes.payload.fbid;
      }

      if (!photoId) {
        throw new Error("Failed to get photo ID from upload response");
      }

      callback(null, { photoId, uploadRes });

    } catch (err) {
      log.error("uploadImage", err);
      callback(err);
    }
  }

  
  async function setAvatar(photoId, caption, timestamp, callback) {
    try {
      const form = {
        av: ctx.userID,
        fb_dtsg: getDtsg(),
        jazoest: generateJazoest(getDtsg()),
        __a: 1,
        __req: "2b",
        __hs: "19534.HYP:comet_pkg.2.1..2.1",
        dpr: 1,
        __ccg: "EXCELLENT",
        __rev: 1006173360,
        __s: "q9f4j2:2o8n7a:6go9y8",
        __hsi: Date.now().toString(),
        __dyn: "7AzHJ4zamaUmgDxqheC1swgE98nwgU6C7UW3qiFwKwPxe3q2ibwNwnof8boG4E6KewXzobohwJwpUe8hohg2eUmC3-V8jK5o4e2CGwEwt86C2q1iwhE2Lwwwg8E2Yx60F9omwn82ywFE5S0IUux62G5UfE31mVEtwEwHw",
        __csr: "",
        __comet_req: 15,
        fb_api_caller_class: "RelayModern",
        fb_api_req_friendly_name: "ProfileCometProfilePictureSetMutation",
        variables: JSON.stringify({
          input: {
            caption: caption || "",
            existing_photo_id: photoId,
            expiration_time: timestamp || null,
            profile_id: ctx.userID,
            profile_pic_method: "EXISTING",
            profile_pic_source: "TIMELINE",
            scaled_crop_rect: {
              height: 1,
              width: 1,
              x: 0,
              y: 0
            },
            skip_cropping: true,
            actor_id: ctx.userID,
            client_mutation_id: Math.round(Math.random() * 1000000).toString()
          },
          isPage: false,
          isProfile: true,
          scale: 3
        }),
        server_timestamps: true,
        doc_id: "2848441488556444" 
      };

      const resData = await defaultFuncs.post(
        "https://www.facebook.com/api/graphql/",
        ctx.jar,
        form
      ).then(parseAndCheckLogin(ctx, defaultFuncs));

      
      let data = resData;
      if (Array.isArray(resData) && resData.length > 0) {
        data = resData[0];
      }

      if (data.errors && data.errors.length > 0) {
        throw new Error(data.errors[0].message || "Failed to set avatar");
      }

      if (data.error) {
        throw new Error(data.error.message || data.error);
      }

      const result = data.data?.profile_picture_set || data.data;
      
      callback(null, {
        success: true,
        photoId: photoId,
        caption: caption,
        expires: timestamp ? new Date(timestamp * 1000).toISOString() : null,
        data: result
      });

    } catch (err) {
      log.error("setAvatar", err);
      callback(err);
    }
  }

  
  return function changeAvatar(image, caption = "", timestamp = null, callback) {
    let resolveFunc, rejectFunc;
    const returnPromise = new Promise(function(resolve, reject) {
      resolveFunc = resolve;
      rejectFunc = reject;
    });

    
    if (!timestamp && getType(caption) === "Number") {
      timestamp = caption;
      caption = "";
    }

    if (!timestamp && !callback && getType(caption) === "Function") {
      callback = caption;
      caption = "";
      timestamp = null;
    }

    if (!callback) {
      callback = function(err, data) {
        if (err) return rejectFunc(err);
        resolveFunc(data);
      };
    }

    
    if (!image) {
      const err = new Error("Image is required (stream, buffer, or file path)");
      callback(err);
      return returnPromise;
    }

    
    (async () => {
      try {
        
        uploadImage(image, (err, uploadData) => {
          if (err) return callback(err);

          
          setAvatar(uploadData.photoId, caption, timestamp, (err, result) => {
            if (err) return callback(err);
            callback(null, result);
          });
        });
      } catch (err) {
        log.error("changeAvatar", err);
        callback(err);
      }
    })();

    return returnPromise;
  };
};
