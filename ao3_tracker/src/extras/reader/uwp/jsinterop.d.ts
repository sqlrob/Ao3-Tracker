/// <reference path="../../../../typings/globals/winjs/index.d.ts" />

declare namespace Ao3TrackHelper {
    interface IKeyValuePair<K, V>{
        key : K;
        value : V;
    }

    interface IIterator<T> {
        readonly current: T;
        getMany : ()=>any;
        readonly hasCurrent : boolean;
        moveNext : ()=>boolean; 
    }
    interface IIterable<T> {
        first: () => IIterator<T>;        
    }

    interface IMapView<K, V> extends IIterable<IKeyValuePair<K,V>> {
        hasKey: (key: K) => boolean;
        lookup: (key: K) => V;
        size: number;
        split: () => { first: IMapView<K, V>; second: IMapView<K, V> };
    }

    interface IMap<K, V>  extends IIterable<IKeyValuePair<K,V>> {
        clear: () => void;
        getView: () => IMapView<K, V>;
        hasKey: (key: K) => boolean;
        insert: (key: K, value: V) => boolean;
        lookup: (key: K) => V;
        remove: (key: K) => void;        
        size: number;
    }

    function getWorkChaptersAsync(works: number[]) : WinJS.Promise<IMap<number,IWorkChapter>>;

    function setWorkChapters(workchapters: IMap<number,IWorkChapter>): void;

    function createWorkChapterMap() : IMap<number,IWorkChapter>;

    function createWorkChapter(number: number, chapterid: number, location: number | null) : IWorkChapter;

    let onjumptolastlocationevent : ((pagejump : boolean)=>void) | null;
    
    function enableJumpToLastLocation(enable : boolean) : void; 

    var canGoBack :boolean;
    var canGoForward :boolean;
    var leftOffset: number;
    var opacity : number;
    var showPrevPageIndicator : boolean;
    var showNextPageIndicator : boolean;

    let onalterfontsizeevent : ((ev: any)=>void) | null;
    let fontSize: number;
}