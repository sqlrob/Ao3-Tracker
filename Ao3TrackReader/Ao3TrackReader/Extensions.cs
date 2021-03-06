﻿/*
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

using System;
using System.Reflection;
using System.Collections.Generic;
using System.Text;
using System.Text.RegularExpressions;
using HtmlAgilityPack;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using System.Linq;

namespace Ao3TrackReader
{
    public static partial class Extensions
    {
        public static string ToLiteral(this string i_string)
        {
            return Newtonsoft.Json.JsonConvert.SerializeObject(i_string);
        }

        public static string ToLiteral(this char c)
        {
            return Newtonsoft.Json.JsonConvert.SerializeObject(c.ToString());
        }

        public static string HtmlDecode(this string str)
        {
            return WebUtility.HtmlDecode(str);
        }
        public static string HtmlEncode(this string str)
        {
            return WebUtility.HtmlEncode(str);
        }

        /*
        public static string[] GetClasses(this HtmlNode node)
        {
            var attrClass = node.Attributes["class"];
            if (attrClass != null && !string.IsNullOrEmpty(attrClass.Value))
                return attrClass.Value.Split(' ');
            return new string[] { };
        }

        public static bool HasClass(this HtmlNode node, string classname)
        {
            return Array.IndexOf(node.GetClasses(), classname) != -1;
        }*/

        public static HtmlNode ElementByClass(this HtmlNode node, string classname)
        {
            foreach (var e in node.ChildNodes)
            {
                if (e.NodeType != HtmlNodeType.Element) continue;

                if (e.HasClass(classname)) return e;
            }
            return null;
        }

        public static HtmlNode ElementByClass(this HtmlNode node, string tagname, string classname)
        {
            foreach (var e in node.Elements(tagname))
            {
                if (e.HasClass(classname)) return e;
            }
            return null;
        }

        public static IEnumerable<HtmlNode> ElementsByClass(this HtmlNode node, string classname)
        {
            foreach (var e in node.ChildNodes)
            {
                if (e.NodeType != HtmlNodeType.Element) continue;
                if (e.HasClass(classname)) yield return e;
            }
        }

        public static IEnumerable<HtmlNode> ElementsByClass(this HtmlNode node, string tagname, string classname)
        {
            foreach (var e in node.Elements(tagname))
            {
                if (e.HasClass(classname)) yield return e;
            }
        }

        public static IEnumerable<HtmlNode> DescendantsByClass(this HtmlNode node, string tagname, string classname)
        {
            foreach (var e in node.Descendants(tagname))
            {
                if (e.HasClass(classname)) yield return e;
            }
        }

        /// <summary>
        /// Blend a color with another color
        /// </summary>
        /// <param name="color">Foreground color</param>
        /// <param name="behind">Background color</param>
        /// <returns></returns>
        public static Xamarin.Forms.Color Blend(this Xamarin.Forms.Color color, Xamarin.Forms.Color behind)
        {
            if (behind.A != 1) behind = behind.Blend(Xamarin.Forms.Color.Black);

            //return new Xamarin.Forms.Color(
            //        Math.Pow(Math.Pow(color.R, 2.2) * color.A + Math.Pow(behind.R, 2.2) * (1 - color.A), 1 / 2.2),
            //        Math.Pow(Math.Pow(color.G, 2.2) * color.A + Math.Pow(behind.G, 2.2) * (1 - color.A), 1 / 2.2),
            //        Math.Pow(Math.Pow(color.B, 2.2) * color.A + Math.Pow(behind.B, 2.2) * (1 - color.A), 1 / 2.2)
            //    );
            return new Xamarin.Forms.Color(
                    color.R * color.A + behind.R * (1 - color.A),
                    color.G * color.A + behind.G * (1 - color.A),
                    color.B * color.A + behind.B * (1 - color.A)
                    );
        }

        public static string ToHex(this Xamarin.Forms.Color color)
        {
            int r = Math.Min(Math.Max((int)Math.Floor(color.R * 255), 0), 255);
            int g = Math.Min(Math.Max((int)Math.Floor(color.G * 255), 0), 255);
            int b = Math.Min(Math.Max((int)Math.Floor(color.B * 255), 0), 255);
            int a = Math.Min(Math.Max((int)Math.Floor(color.A * 255), 0), 255);

            if (a != 255) return string.Format("#{0:X2}{1:X2}{2:X2}{3:X2}", a, r, g, b);
            else return string.Format("#{0:X2}{1:X2}{2:X2}", r, g, b);
        }

        public static async Task<HtmlDocument> ReadAsHtmlDocumentAsync(this HttpContent httpContent)
        {
            HtmlDocument doc = new HtmlDocument();
            var content = await httpContent.ReadAsStringAsync();
            if (!String.IsNullOrWhiteSpace(content)) doc.Load(new System.IO.StringReader(content));
            return doc;
        }

#if __WINDOWS__
        public static Windows.UI.Color ToWindows(this Xamarin.Forms.Color color)
        {
            return Windows.UI.Color.FromArgb((byte)(color.A * 255), (byte)(color.R * 255), (byte)(color.G * 255), (byte)(color.B * 255));
        }
        public static Windows.UI.Xaml.Media.SolidColorBrush ToWindowsBrush(this Xamarin.Forms.Color color)
        {
            return new Windows.UI.Xaml.Media.SolidColorBrush(Windows.UI.Color.FromArgb((byte)(color.A * 255), (byte)(color.R * 255), (byte)(color.G * 255), (byte)(color.B * 255)));
        }

        public static Xamarin.Forms.Color ToXamarin(this Windows.UI.Color color)
        {
            return Xamarin.Forms.Color.FromRgba((int)color.R, (int)color.G, (int)color.B, (int)color.A);
        }
#endif

        public static IEnumerable<T> FindChildren<T>(this Xamarin.Forms.Element elem)
            where T: Xamarin.Forms.Element
        {
            Stack<Xamarin.Forms.IElementController> elems = new Stack<Xamarin.Forms.IElementController>(10);
            elems.Push(elem);
            while (elems.Count != 0)
            {
                var e = elems.Pop();
                foreach (var c in e.LogicalChildren)
                {
                    if (c is T ret) yield return ret;
                    elems.Push(c);
                }
            }
        }

        static DateTime UnixEpoc = new DateTime(1970, 1, 1, 0, 0, 0, DateTimeKind.Utc);
        public static long ToUnixTime(this DateTime time)
        {
            return (DateTime.UtcNow - UnixEpoc).Ticks / 10000L + UnixTimeOffset;
        }

        static public long UnixTimeOffset { get; set; } = 0;

        public static IReadOnlyCollection<T> ToReadOnly<T>(this ICollection<T> col)
        {
            if (col is IReadOnlyCollection<T> roc) return roc;
            if (col is IList<T> list) return new System.Collections.ObjectModel.ReadOnlyCollection<T>(list);
            return new System.Collections.ObjectModel.ReadOnlyCollection<T>(col.ToList());
        }

        public static IReadOnlyDictionary<K, V> ToReadOnly<K, V>(this IDictionary<K,V> dict)
        {
            if (dict is IReadOnlyDictionary<K, V> rod) return rod;
            return new System.Collections.ObjectModel.ReadOnlyDictionary<K,V>(dict);
        }

        public static bool TryWait(this Task task)
        {
            try
            {
                task.Wait();
            }
            catch
            {
                return false;
            }
            return task.IsCompleted;
        }

        public static T WaitGetResult<T>(this Task<T> task)
        {
            try
            {
                task.Wait();
            }
            catch
            {
                return default(T);
            }
            return task.Result;
        }

        public static int GetHashCodeSafe<T>(this T obj)
            where T : class
        {
            if (obj == null) return 0;
            return obj.GetHashCode();
        }


        static private Dictionary<string, string> pooledStrings = new Dictionary<string, string>();
        static public string PoolString(this string tag)
        {
            if (tag == null) return null;
            lock (pooledStrings)
            {
                if (pooledStrings.TryGetValue(tag, out var result))
                    return result;

                return pooledStrings[tag] = tag;
            }
        }

#if __WINDOWS__
        static public string GetDependencyPropertyName(this Windows.UI.Xaml.DependencyObject obj, Windows.UI.Xaml.DependencyProperty depprop)
        {
            foreach (var field in obj.GetType().GetFields(BindingFlags.FlattenHierarchy | BindingFlags.Static | BindingFlags.Public))
            {
                if (field.FieldType == typeof(Windows.UI.Xaml.DependencyProperty) && field.GetValue(null) == depprop)
                {
                    return field.Name;
                }
            }

            foreach (var prop in obj.GetType().GetProperties(BindingFlags.FlattenHierarchy | BindingFlags.Static | BindingFlags.Public))
            {
                if (prop.PropertyType == typeof(Windows.UI.Xaml.DependencyProperty) && prop.GetValue(null) == depprop)
                {
                    return prop.Name;
                }
            }

            return null;
        }
#endif
    }
}
