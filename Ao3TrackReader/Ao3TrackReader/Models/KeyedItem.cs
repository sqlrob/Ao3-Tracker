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
using System.Collections.Generic;
using System.Text;

namespace Ao3TrackReader.Models
{
    public class KeyedItem<TKey,TValue>
    {
        public TKey Key { get; set; }
        public TValue Value { get; set; }

        public KeyedItem() { }
        public KeyedItem(TKey key, TValue value)
        {
            Key = key;
            Value = value;
        }

        public override string ToString()
        {
            return Value?.ToString() ?? "(null)";
        }

        public override int GetHashCode()
        {
            return Key?.GetHashCode() ?? 0;
        }

        public override bool Equals(object obj)
        {
            var o = obj as KeyedItem<TKey,TValue>;
            if (o == null) return false;
            return object.Equals(Key, o.Key) && object.Equals(Value, o.Value);
        }
    }
    public class KeyedItem<TKey> : KeyedItem<TKey, string>
    {
        public KeyedItem() { }
        public KeyedItem(TKey key, string value) : base(key, value)
        {
        }
    }
}