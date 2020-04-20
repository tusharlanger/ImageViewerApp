import * as Constants from "./Constants";
import * as Utils from "./Utils";

export const findValidationMessageClassname = (value, type) => {
  if (type === Constants.ValueTypeEnum.FORM_FIELD) {
    return Utils.isUndefinedOrNullOrEmpty(value)
      ? Constants.DisplayClassname.DISPLAY_BLOCK
      : Constants.DisplayClassname.DISPLAY_NONE;
  } else if (type === Constants.ValueTypeEnum.VALIDATION_MESSAGE) {
    return Utils.isUndefinedOrNullOrEmpty(value)
      ? Constants.DisplayClassname.DISPLAY_NONE
      : Constants.DisplayClassname.DISPLAY_BLOCK;
  }
  return "";
};

export const likeOrUnlikeImage = (imageData, imagePostIndex, actionType) => {
  if (
    !Utils.isUndefinedOrNull(imageData) &&
    !Utils.isUndefinedOrNullOrEmpty(
      imagePostIndex && !Utils.isUndefinedOrNullOrEmpty(actionType)
    )
  ) {
    switch (actionType) {
      case Constants.HeartButtonAction.LIKE:
        imageData[imagePostIndex].like = true;
        imageData[imagePostIndex].likes.count = Utils.isUndefinedOrNull(
          imageData[imagePostIndex].likes.count
        )
          ? 1
          : Number(imageData[imagePostIndex].likes.count) + 1;
        break;
      case Constants.HeartButtonAction.UNLIKE:
        imageData[imagePostIndex].like = false;
        imageData[imagePostIndex].likes.count =
          Number(imageData[imagePostIndex].likes.count) - 1;
        break;
      default:
        return;
    }
    return imageData;
  }
  return null;
};

export const addUserComment = (imageData, comment, currentImageIndex) => {
  if (
    !Utils.isUndefinedOrNullOrEmpty(comment) &&
    !Utils.isUndefinedOrNullOrEmpty(currentImageIndex)
  ) {
    let commentsArr = [];
    commentsArr =
      Utils.isUndefinedOrNull(imageData[currentImageIndex].commentList) ||
      imageData[currentImageIndex].commentList.length === 0
        ? []
        : imageData[currentImageIndex].commentList;

    commentsArr.push({
      id: "comment-" + new Date().getTime(),
      username: sessionStorage.getItem("user-details"),
      comment: comment
    });

    imageData[currentImageIndex].commentList = commentsArr;
    return imageData;
  }
  return null;
};
