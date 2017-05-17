/*
Copyright 2017 Alexis Ryan

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

interface Window {
    jQuery: JQueryStatic;
}

namespace Ao3Track {

    export let jQuery = window.jQuery.noConflict(true);
    export let $ = jQuery;

    // Don't want wrapped function please. >:(
    export function unWrapHR<T extends Function>(f: T, bindto?: object) : T
    {
        let ret : T;
        if ((f as any)["nr@original"]) ret = (f as any)["nr@original"];
        else ret = f;
        if (bindto) ret = ret.bind(bindto);
        return ret;
    }
    
    export let setImmediate = unWrapHR(window.setImmediate,window);
    export let setInterval = unWrapHR(window.setInterval,window);
    export let setTimeout = unWrapHR(window.setTimeout,window);
    export let clearImmediate = unWrapHR(window.clearImmediate,window);
    export let clearInterval = unWrapHR(window.clearInterval,window);
    export let clearTimeout = unWrapHR(window.clearTimeout,window);
    export let addEventListener = unWrapHR(EventTarget.prototype.addEventListener);
    export let removeEventListener = unWrapHR(EventTarget.prototype.removeEventListener);

    export function InjectCSS (styles: string){
            let blob = new Blob([styles],{type: 'text/css', endings: "transparent"});
            let link = document.createElement('link');
            link.type = 'text/css';
            link.rel = 'stylesheet';
            link.href = URL.createObjectURL(blob);
            document.getElementsByTagName('head')[0].appendChild(link);
        };

    GetWorkDetails = (works: number[],  callback: (details: { [key:number]:IWorkDetails }) => void, flags?: WorkDetailsFlags) => {
        Ao3Track.Helper.getWorkDetailsAsync(works, flags || WorkDetailsFlags.All, callback);
    };

    SetWorkChapters = (workchapters: { [key: number]: IWorkChapter; }) => {
        Ao3Track.Helper.setWorkChapters(workchapters);
    };

    SetNextPage = (uri: string) => {
        Ao3Track.Helper.nextPage = uri;
    };
    let $next = jQuery('head link[rel=next]');
    if ($next.length > 0) { SetNextPage(($next[0] as HTMLAnchorElement).href); }

    SetPrevPage = (uri: string) => {
        Ao3Track.Helper.prevPage = uri;
    };
    let $prev = jQuery('head link[rel=prev]');
    if ($prev.length > 0) { SetPrevPage(($prev[0] as HTMLAnchorElement).href); }

    DisableLastLocationJump = () => {
        Ao3Track.Helper.onjumptolastlocationevent = null;
    };

    EnableLastLocationJump = (workid: number, lastloc: IWorkChapter) => {
        Ao3Track.Helper.onjumptolastlocationevent = (ev) => {
            if (Boolean(ev)) {
                Ao3Track.Helper.getWorkDetailsAsync([workid], WorkDetailsFlags.SavedLoc, (details) => { 
                    let d = details[workid] || { };
                    if (d.savedLoc) {
                        lastloc = d.savedLoc;
                        Ao3Track.scrollToLocation(workid,lastloc,true); 
                    }
                });
            }
            else {
                Ao3Track.scrollToLocation(workid,lastloc,false); 
            }
        };
    };

    // Font size up/down support 
    Ao3Track.Helper.onalterfontsizeevent = (ev) => {
        let fontsize = Number(ev);
        let inner = document.getElementById("inner");
        if (inner) {
            inner.style.fontSize = fontsize.toString() + "%";
        }
    };

    SetCurrentLocation = (current : IWorkChapterEx) => {
        Ao3Track.Helper.currentLocation = current;
    };

    AreUrlsInReadingList = (urls: string[], callback: (result: { [key:string]:boolean})=> void) => {
        Ao3Track.Helper.areUrlsInReadingListAsync(urls,callback);
    };

    GetUnitConvOptions = (callback: (result: IUnitConvOptions)=>void) => {
        Ao3Track.Helper.getUnitConvOptions(callback);
    };

    function contextMenuHandler(ev: MouseEvent) {
        for (let target = ev.target as (HTMLElement|null); target && target !== document.body; target = target.parentElement) {
            let a = target as HTMLAnchorElement;
            if (target.tagName === "A" && a.href && a.href !== "") {
                ev.preventDefault();
                ev.stopPropagation();

                let clientToDev = Ao3Track.Helper.deviceWidth / window.innerWidth;
                Ao3Track.Helper.showContextMenu(ev.clientX * clientToDev, ev.clientY * clientToDev, a.href, a.innerHTML);
                return;
            }
        }
    }  
    addEventListener.call(document.body,"contextmenu", contextMenuHandler);
    Ao3Track.Helper.setCookies(document.cookie);

    // Page title handling
    let pageTitle : IPageTitle = { title: jQuery("h2.heading").first().text().trim() };
    if (pageTitle.title === null || pageTitle.title === "" || pageTitle.title === undefined) {
        pageTitle.title = document.title;
        pageTitle.title = pageTitle.title.endsWith(" | Archive of Our Own") ? pageTitle.title.substr(0, pageTitle.title.length - 21) : pageTitle.title;
        pageTitle.title = pageTitle.title.endsWith(" [Archive of Our Own]") ? pageTitle.title.substr(0, pageTitle.title.length - 21) : pageTitle.title;        
    }
    else {
        let $c = jQuery("#chapters h3.title");
        if ($c.length >0)
        {
            let $num = $c.children("a").first();
            if ($num.length > 0) {
                pageTitle.chapter = $num.text().trim();

                let name = "";
                
                for (let node = $num[0].nextSibling; node !== null; node = node.nextSibling) {
                    if (node.nodeType === Node.TEXT_NODE)
                    {
                        name += (node.textContent || "");
                    }
                }

                name = name.trim();
                if (name.startsWith(":")) { name = name.substr(1); }
                name = name.trim();
                if (name.length > 0 && name !== pageTitle.chapter) {
                    pageTitle.chaptername = name;
                }
            }
        }

        let $authors = jQuery("h3.heading a[rel=author]");
        if ($authors.length > 0) {
            let authors : string[] = [];
            $authors.each((index,elem)=>{
                if (elem.textContent) { authors.push(elem.textContent.trim()); }
            });
            if (authors.length > 0) { pageTitle.authors = authors; }
        }

        let $fandoms = jQuery(".meta dd.fandom.tags a.tag");
        if ($fandoms.length > 0) {
            let fandoms : string[] = [];
            $fandoms.each((index,elem)=>{
                if (elem.textContent) { fandoms.push(elem.textContent.trim()); }
            });
            if (fandoms.length > 0) { pageTitle.fandoms = fandoms; }
        }

        let $relationships = jQuery(".meta dd.relationship.tags a.tag").first();
        if ($relationships.length > 0) {
            pageTitle.primarytag = $relationships.text().trim() || null;
        }
    }

    Ao3Track.Helper.pageTitle = pageTitle;
};
