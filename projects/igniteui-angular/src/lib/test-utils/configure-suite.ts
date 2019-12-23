import { TestBed, getTestBed, ComponentFixture } from '@angular/core/testing';
import { resizeObserverIgnoreError } from './helper-utils.spec';
import { UIInteractions } from './ui-interactions.spec';

/**
 * Per https://github.com/angular/angular/issues/12409#issuecomment-391087831
 * Destroy fixtures after each, reset testing module after all
 * @hidden
 */
export const configureTestSuite = () => {
  const testBedApi: any = getTestBed();
  const originReset = TestBed.resetTestingModule;

  beforeAll(() => {
    // TestBed.resetTestingModule();
    TestBed.resetTestingModule = () => TestBed;
    resizeObserverIgnoreError();
  });
  afterEach(() => {
    UIInteractions.clearOverlay();
    testBedApi._activeFixtures.forEach((fixture: ComponentFixture<any>) => fixture.destroy());
    testBedApi._instantiated = false;
  });

  afterAll(() => {
    TestBed.resetTestingModule = originReset;
    TestBed.resetTestingModule();
  });
};
