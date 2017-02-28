﻿using System;
using System.Collections.Generic;
using System.Reflection;

#if __ANDROID__
using Android.Webkit;
using Java.Interop;
#endif

namespace Ao3TrackReader.Helper
{
    [AttributeUsage(AttributeTargets.Property | AttributeTargets.Parameter | AttributeTargets.Event | AttributeTargets.Method, AllowMultiple = false)]
    sealed class ConverterAttribute : Attribute
    {
        internal string converter;
        public ConverterAttribute(string converter)
        {
            this.converter = converter;
        }
    }

    [AttributeUsage(AttributeTargets.Property | AttributeTargets.Method | AttributeTargets.Event, AllowMultiple = false)]
    sealed class DefIgnoreAttribute : Attribute
    {
    }

    sealed class MemberDef
    {
        public string @return { get; set; }
        public Dictionary<int, string> args { get; set; }
        public string getter { get; set; }
        public string setter { get; set; }
        public int? promise { get; set; }
        public string gettername { get; set; }
        public string settername { get; set; }
    }

    sealed class HelperDef : Dictionary<string, MemberDef>
    {
        public void FillFromType(Type type)
        {
            foreach (var mi in type.GetMethods(BindingFlags.Public | BindingFlags.DeclaredOnly | BindingFlags.Instance))
            {
                if (mi.IsSpecialName) continue;

#if __ANDROID__
                
                if (mi.GetCustomAttribute<JavascriptInterfaceAttribute>() == null)
                    continue;
#endif

                if (mi.GetCustomAttribute<DefIgnoreAttribute>() != null)
                    continue;

                MemberDef md;
                var mdf = type.GetField("md_" + mi.Name, BindingFlags.DeclaredOnly | BindingFlags.Static | BindingFlags.NonPublic);
                if (mdf != null)
                    md = (MemberDef)mdf.GetValue(null);
                else
                    md = new MemberDef();

                if (md == null)
                    continue;

                string name = mi.Name;

#if __ANDROID__
                var ax = mi.GetCustomAttribute<ExportAttribute>();
                if (ax != null)
                    name = ax.Name;
                else
#endif
                name = name.Substring(0, 1).ToLower() + name.Substring(1);

                md.args = md.args ?? new Dictionary<int, string>();

                var pa = mi.GetParameters();
                for (int i = 0; i < pa.Length; i++)
                {
                    if (!md.args.ContainsKey(i))
                    {
                        var pi = pa[i];
                        var conv = pi.GetCustomAttribute<ConverterAttribute>()?.converter;
                        if (!string.IsNullOrEmpty(conv)) md.args[i] = conv;
                    }
                }

                if (md.@return == null)
                {
                    var conv = mi.GetCustomAttribute<ConverterAttribute>()?.converter;
                    if (!string.IsNullOrEmpty(conv)) md.@return = conv;
                }

#if WINDOWS_UWP
                if (md.promise == null && mi.ReturnType.IsConstructedGenericType)
                {
                    var generic = mi.ReturnType.GetGenericTypeDefinition();
                    if (generic == typeof (Windows.Foundation.IAsyncOperation<>))
                    {
                        md.promise = pa.Length;
                    }
                }
#endif
                Add(name, md);
            }

#if WINDOWS_UWP
            foreach (var ei in type.GetEvents(BindingFlags.Public | BindingFlags.DeclaredOnly | BindingFlags.Instance))
            {
                if (ei.GetCustomAttribute<DefIgnoreAttribute>() != null)
                    continue;

                MemberDef md;
                var mdf = type.GetField("md_" + ei.Name, BindingFlags.DeclaredOnly | BindingFlags.Static | BindingFlags.NonPublic);
                if (mdf != null) md = (MemberDef) mdf.GetValue(null);
                else md = new MemberDef();

                if (md == null)
                    continue;

                string name = "on" + ei.Name.ToLower();

                if (md.setter == null)
                {
                    var conv = ei.GetCustomAttribute<ConverterAttribute>()?.converter;
                    if (!string.IsNullOrEmpty(conv)) md.setter = conv;
                    else md.setter = "true";
                }

                Add(name, md);

            }
#endif

            foreach (var pi in type.GetProperties(BindingFlags.Public | BindingFlags.DeclaredOnly | BindingFlags.Instance))
            {
                if (pi.GetCustomAttribute<DefIgnoreAttribute>() != null)
                    continue;

                MemberDef md;
                var mdf = type.GetField("md_" + pi.Name, BindingFlags.DeclaredOnly | BindingFlags.Static | BindingFlags.NonPublic);
                if (mdf != null) md = (MemberDef)mdf.GetValue(null);
                else md = new MemberDef();

                if (md == null)
                    continue;

                string name = pi.Name;
                name = name.Substring(0, 1).ToLower() + name.Substring(1);

                var setter = pi.GetSetMethod();
                if (setter != null && setter.GetCustomAttribute<DefIgnoreAttribute>() == null)
#if __ANDROID__
                if (setter != null && setter.GetCustomAttribute<JavascriptInterfaceAttribute>() != null)
#endif
                {

                    if (md.setter == null)
                    {
                        var conv = setter.GetCustomAttribute<ConverterAttribute>()?.converter;
                        if (!string.IsNullOrEmpty(conv)) md.setter = conv;
                        else md.setter = "true";
                    }
#if __ANDROID__
                    if (md.settername == null)
                    {
                        var ax = setter.GetCustomAttribute<ExportAttribute>();
                        if (ax != null)
                            md.settername = ax.Name;
                        else
                            md.setter = null;
                    }
#endif
                }

                var getter = pi.GetGetMethod();
                if (getter != null && getter.GetCustomAttribute<DefIgnoreAttribute>() == null)
#if __ANDROID__
                if (getter != null && getter.GetCustomAttribute<JavascriptInterfaceAttribute>() != null)
#endif
                {
                    if (md.getter == null)
                    {
                        var conv = getter.GetCustomAttribute<ConverterAttribute>()?.converter;
                        if (!string.IsNullOrEmpty(conv)) md.getter = conv;
                        else md.getter = "true";
                    }
#if __ANDROID__
                    if (md.gettername == null)
                    {
                        var ax = getter.GetCustomAttribute<ExportAttribute>();
                        if (ax != null)
                            md.gettername = ax.Name;
                        else
                            md.getter = null;
                    }
#endif
                }

                if (md.setter == null && md.getter == null)
                    continue;

                Add(name, md);
            }
        }
        public string Serialize()
        {
            var settings = new Newtonsoft.Json.JsonSerializerSettings();
            settings.NullValueHandling = Newtonsoft.Json.NullValueHandling.Ignore;
            return Newtonsoft.Json.JsonConvert.SerializeObject(this, settings);
        }
    }
}
