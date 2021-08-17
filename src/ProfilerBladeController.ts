import {
  Controller,
  Ticker,
  ViewProps,
} from '@tweakpane/core';
import { ProfilerBladeDefaultMeasureHandler } from './ProfilerBladeDefaultMeasureHandler';
import { ProfilerBladeView } from './ProfilerBladeView';
import type { ProfilerBladeControllerConfig } from './ProfilerBladeControllerConfig';
import type { ProfilerBladeMeasureHandler } from './ProfilerBladeMeasureHandler';
import type { ProfilerEntry } from './ProfilerEntry';

// Custom controller class should implement `Controller` interface
export class ProfilerBladeController implements Controller<ProfilerBladeView> {
  public targetLength: number;
  public measureHandler: ProfilerBladeMeasureHandler;
  public readonly view: ProfilerBladeView;
  public readonly viewProps: ViewProps;
  private ticker_: Ticker;

  private entryStack_: ProfilerEntry[];
  private lastRootEntry_: ProfilerEntry;

  public constructor( doc: Document, config: ProfilerBladeControllerConfig ) {
    this.targetLength = config.targetLength;

    this.onTick_ = this.onTick_.bind( this );

    this.ticker_ = config.ticker;
    this.ticker_.emitter.on( 'tick', this.onTick_ );

    this.viewProps = config.viewProps;

    this.view = new ProfilerBladeView( doc, {
      targetLength: this.targetLength,
      unitString: config.unitString,
      fractionDigits: config.fractionDigits,
      viewProps: this.viewProps,
    } );

    this.viewProps.handleDispose( () => {
      this.ticker_.dispose();
    } );

    this.measureHandler = new ProfilerBladeDefaultMeasureHandler();

    this.entryStack_ = [];
    this.lastRootEntry_ = {
      name: 'root',
      path: '/root',
      length: 0.0,
      children: [],
    };
  }

  public measure( name: string, fn: () => void ): void {
    const parent = this.entryStack_[ this.entryStack_.length - 1 ];
    const path = `${ parent?.path ?? '' }/${ name }`;

    const entry: ProfilerEntry = {
      name,
      path,
      length: 0.0,
      children: [],
    };

    if ( parent != null ) {
      this.entryStack_[ this.entryStack_.length - 1 ].children.push( entry );
    }

    this.entryStack_.push( entry );

    entry.length = this.measureHandler.measure( path, fn );

    this.entryStack_.pop();

    if ( parent == null ) {
      this.lastRootEntry_ = entry;
    }
  }

  private onTick_(): void {
    this.view.update( this.lastRootEntry_ );
  }
}