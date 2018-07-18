import { IPositionStrategy } from './IPositionStrategy';
import { PositionSettings, Point, HorizontalAlignment, VerticalAlignment, getPointFromPositionsSettings } from './../utilities';
import { scaleInVerTop, scaleOutVerTop } from '../../../animations/main';

export class ConnectedPositioningStrategy implements IPositionStrategy {
  private _defaultSettings: PositionSettings = {
    target: new Point(0, 0),
    horizontalDirection: HorizontalAlignment.Right,
    verticalDirection: VerticalAlignment.Bottom,
    horizontalStartPoint: HorizontalAlignment.Left,
    verticalStartPoint: VerticalAlignment.Bottom,
    openAnimation: scaleInVerTop,
    closeAnimation: scaleOutVerTop
  };

  public settings: PositionSettings;
  constructor(settings?: PositionSettings) {
    this.settings = Object.assign({}, this._defaultSettings, settings);
  }

  // we no longer use the element inside the position() as its dimensions are cached in rect
  position(contentElement, size): void {
    const eWidth = size.width;
    const eHeight = size.height;

    contentElement.style.top = getPointFromPositionsSettings(this.settings).y + this.settings.verticalDirection * size.height + 'px';
    contentElement.style.left = getPointFromPositionsSettings(this.settings).x + this.settings.horizontalDirection * size.width + 'px';
  }
}

