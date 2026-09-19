'use client';

import { useState, useMemo } from 'react';
import {
  Trash2, Eye, EyeOff, ChevronDown, ChevronUp,
  Search, Check, Plus, Pencil, X, Save, GripVertical,
  LayoutGrid, Sparkles, Star, Zap, TrendingUp, Trophy,
  Flame, Heart, Crown, Rocket, Target, Shield, Gem,
  Award, Medal, Lightbulb, Brain, Cpu, Smartphone,
  Laptop, Headphones, Camera, Gamepad2, Music, Film,
  BookOpen, Newspaper, Megaphone, Bell, MessageSquare,
  Globe, Wifi, BarChart3, PieChart, Clock, Calendar,
  Layers, Grid3x3, Monitor, Tablet, Watch, Speaker,
  Code, Terminal, Database, Server, Cloud, Lock,
  Compass, Map, Flag, Gift, Package, ShoppingCart,
  Tag, Wallet, DollarSign, Users, GraduationCap, Briefcase,
  Building, Home, Palette, Brush, Hammer, CircleDot,
  Hexagon, Diamond, CheckCircle, Info, AlertCircle, Leaf,
  Mountain, Waves, Sun, Moon, Radio, Tv,
  Rss, Podcast, QrCode, Share2, Mail, Send,
  Paperclip, Link, ExternalLink, Copy, Printer,
  Settings, Wrench, Power, Plug, Battery, Bluetooth,
  Signal, Navigation, MapPin, Key, Ban, HelpCircle,
  XCircle, Play, Pause, SkipForward, SkipBack,
  Volume2, Mic, Video, FileText, Image as ImageIcon,
  Folder, Archive, Inbox, Reply, Forward,
  TrendingDown, ArrowUpRight, ArrowDown, ArrowLeft,
  ArrowRight, ChevronsRight, Move, Maximize, Minimize,
  ZoomIn, ZoomOut, Filter, SortAsc, SlidersHorizontal,
  RotateCcw, RefreshCw, Upload, Download,
  CloudRain, Thermometer, Wind, Droplets, TreePine,
  Umbrella, Flower2, TreeDeciduous, Dog, Cat, Bird,
  Fish, Bug, Pizza, Apple, Beef, IceCream,
  Coffee, Utensils, Factory, PiggyBank, Coins,
  BadgeCheck, UserCheck, UserPlus, PersonStanding,
  Scissors, PenTool, Ruler, Magnet,
  Anchor, Octagon, Triangle, Square, Pentagon,
  Cross, Minus, Equal, ChevronsLeft, ChevronsUp,
  ChevronsDown, BatteryCharging, BatteryFull, BatteryLow,
  BatteryMedium, CloudLightning, CloudMoon, CloudSun,
  Snowflake, Sunrise, Sunset, Rainbow,
  Rabbit, Squirrel, Cherry, Citrus, Grape,
  Banana, Egg, Cookie, Cake, Sandwich, Soup,
  Drum, Guitar, Piano,
  Clapperboard, Disc, Volume1, Hand, ThumbsUp,
  ThumbsDown, Smile, Frown, Skull, Ghost,
  PartyPopper, Timer, Hourglass, AlarmClock,
  TrendingDown as TrendingDownIcon, Bookmark, BookmarkCheck,
  ClipboardList, FileSearch, FileCode, FilePlus,
  FileMinus, FileCheck, FolderPlus, FolderOpen,
  Contact, IdCard, Scan,
  Fingerprint, ShieldCheck, ShieldAlert, ShieldX,
  Swords, Crosshair, Orbit, Aperture, Focus,
  Pipette, FlipVertical, FlipHorizontal, Crop,
  RotateCw, Shrink, Expand, Move3d, Box,
  Cylinder, Circle, Triangle as TriangleIcon,
  Pentagon as PentagonIcon, Hexagon as HexagonIcon,
  Octagon as OctagonIcon, Square as SquareIcon,
  Diamond as DiamondIcon, Heart as HeartIcon,
  Star as StarIcon, Hexagon as HexIcon,
  Activity, Disc as DiscIcon, Binary, BrickWall,
  Container, HardDrive, Cpu as CpuIcon,
  MonitorCheck, MonitorX, MonitorPlay,
  Smartphone as SmartphoneIcon, Tablet as TabletIcon,
  Watch as WatchIcon,
  Accessibility, Armchair, Bed, Sofa,
  Store, School, Hospital, Church, Landmark,
  Stethoscope, Pill, Syringe, Thermometer as ThermometerIcon,
  Bone, Dna, Microscope, Scan as ScanIcon,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

// Full icon catalogue. Exported so the manager can background-load the map
// for header display without blocking the initial paint.
export const ICON_LIST: [string, LucideIcon][] = [
  ['Activity', Activity], ['AlarmClock', AlarmClock], ['AlertCircle', AlertCircle],
  ['Anchor', Anchor], ['Apple', Apple], ['Aperture', Aperture],
  ['Archive', Archive], ['ArrowDown', ArrowDown], ['ArrowLeft', ArrowLeft],
  ['ArrowRight', ArrowRight], ['ArrowUpRight', ArrowUpRight], ['Award', Award],
  ['BadgeCheck', BadgeCheck], ['Ban', Ban], ['Banana', Banana],
  ['BarChart3', BarChart3], ['Beef', Beef],
  ['Bell', Bell], ['Battery', Battery], ['BatteryCharging', BatteryCharging],
  ['BatteryFull', BatteryFull], ['BatteryLow', BatteryLow], ['BatteryMedium', BatteryMedium],
  ['Bed', Bed], ['Bird', Bird],
  ['Bitcoin', Zap],   ['Bookmark', Bookmark], ['BookmarkCheck', BookmarkCheck],
  ['Box', Box], ['Brain', Brain], ['Briefcase', Briefcase], ['Brush', Brush],
  ['Bug', Bug], ['Building', Building], ['Cake', Cake],
  ['Calendar', Calendar], ['Camera', Camera],
  ['Cast', Radio], ['Cat', Cat], ['Check', Check],
  ['CheckCircle', CheckCircle], ['ChevronDown', ChevronDown], ['ChevronUp', ChevronUp],
  ['ChevronsDown', ChevronsDown], ['ChevronsLeft', ChevronsLeft],
  ['ChevronsRight', ChevronsRight], ['ChevronsUp', ChevronsUp],
  ['Cherry', Cherry], ['Circle', Circle], ['CircleDot', CircleDot],
  ['Clipboard', Paperclip], ['ClipboardList', ClipboardList], ['Clock', Clock],
  ['Cloud', Cloud], ['CloudLightning', CloudLightning], ['CloudRain', CloudRain],
  ['CloudSun', CloudSun], ['Code', Code], ['Coffee', Coffee],
  ['Coins', Coins], ['Compass', Compass], ['Contact', Contact],
  ['Cookie', Cookie], ['Copy', Copy],
  ['Copyright', Ban], ['Cpu', Cpu], ['Creative Commons', Ban],
  ['CreditCard', Wallet], ['Crosshair', Crosshair], ['Cross', Cross],
  ['Crown', Crown], ['Cube', Box], ['Database', Database],
  ['Delete', Trash2], ['Diamond', Diamond], ['Disc', Disc],
  ['Dna', Dna], ['Dog', Dog], ['DollarSign', DollarSign],
  ['Download', Download], ['Drama', Film], ['Droplets', Droplets],
  ['Drum', Drum], ['Egg', Egg], ['Equal', Equal],
  ['ExternalLink', ExternalLink], ['Eye', Eye], ['EyeOff', EyeOff],
  ['Factory', Factory], ['Fingerprint', Fingerprint], ['FileCheck', FileCheck],
  ['FileCode', FileCode], ['FileMinus', FileMinus], ['FilePlus', FilePlus],
  ['FileSearch', FileSearch], ['FileText', FileText], ['Filter', Filter],
  ['Fire', Flame], ['Fish', Fish],
  ['Flame', Flame], ['FlipHorizontal', FlipHorizontal], ['FlipVertical', FlipVertical],
  ['Flower2', Flower2], ['Folder', Folder], ['FolderOpen', FolderOpen],
  ['FolderPlus', FolderPlus], ['Forward', Forward], ['Frown', Frown],
  ['Gamepad2', Gamepad2], ['Gem', Gem], ['Gift', Gift],
  ['Globe', Globe], ['Grape', Grape], ['Grid3x3', Grid3x3],
  ['Guitar', Guitar], ['Hammer', Hammer], ['Hand', Hand],
  ['HardDrive', Database], ['Headphones', Headphones], ['Heart', Heart],
  ['Hexagon', Hexagon], ['Home', Home], ['Hourglass', Hourglass],
  ['IceCream', IceCream], ['IdCard', IdCard], ['Image', ImageIcon],
  ['Inbox', Inbox], ['Info', Info], ['Key', Key],
  ['Knife', Scissors], ['Landmark', Landmark], ['Layers', Layers],
  ['LayoutGrid', LayoutGrid], ['Leaf', Leaf], ['Lightbulb', Lightbulb],
  ['Link', Link], ['Lock', Lock], ['Login', Send],
  ['Logout', Reply], ['Laptop', Laptop], ['Laugh', Smile],
  ['Mail', Mail], ['Magnet', Magnet], ['Map', Map],
  ['MapPin', MapPin], ['Medal', Medal], ['Megaphone', Megaphone],
  ['Mic', Mic], ['Microscope', Microscope], ['Minimize', Minimize],
  ['Minus', Minus], ['Monitor', Monitor], ['Moon', Moon],
  ['Mountain', Mountain], ['Mouse', Monitor], ['Move', Move],
  ['Music', Music], ['Navigation', Navigation], ['Newspaper', Newspaper],
  ['Octagon', Octagon], ['Orbit', Orbit], ['Package', Package],
  ['Palette', Palette], ['Paperclip', Paperclip], ['PartyPopper', PartyPopper],
  ['Pause', Pause], ['PenTool', PenTool], ['Pentagon', Pentagon],
  ['Phone', Smartphone], ['PieChart', PieChart], ['Pill', Pill],
  ['Pin', MapPin], ['Pizza', Pizza], ['Play', Play],
  ['Plug', Plug], ['Podcast', Podcast], ['Power', Power],
  ['Printer', Printer], ['Piano', Piano], ['QrCode', QrCode],
  ['Rabbit', Rabbit], ['Radio', Radio], ['Rainbow', Rainbow],
  ['RefreshCw', RefreshCw], ['Repeat', RotateCcw], ['Reply', Reply],
  ['Ruler', Ruler], ['RotateCcw', RotateCcw], ['RotateCw', RotateCw],
  ['Sandwich', Sandwich], ['Save', Save], ['Scan', Scan],
  ['Scissors', Scissors], ['Screen', Monitor],
  ['Search', Search], ['Send', Send], ['Server', Server],
  ['Settings', Settings], ['Shield', Shield], ['ShieldAlert', ShieldAlert],
  ['ShieldCheck', ShieldCheck], ['ShieldX', ShieldX], ['Shrink', Shrink],
  ['Signal', Signal], ['Skull', Skull], ['Smile', Smile],
  ['Snowflake', Snowflake], ['Sofa', Bed], ['Soup', Soup],
  ['Speaker', Speaker], ['Square', Square], ['Squirrel', Squirrel],
  ['Star', Star], ['Sun', Sun], ['Sunrise', Sunrise],
  ['Sunset', Sunset], ['Syringe', Syringe], ['Tablet', Tablet],
  ['Tag', Tag], ['Target', Target], ['Thermometer', Thermometer],
  ['ThumbsDown', ThumbsDown], ['ThumbsUp', ThumbsUp], ['Timer', Timer],
  ['Tools', Wrench], ['Tornado', Wind], ['TreeDeciduous', TreeDeciduous],
  ['TreePine', TreePine], ['Triangle', Triangle], ['Trophy', Trophy],
  ['Truck', Package], ['Tv', Tv],
  ['Twitch', Radio], ['Twitter', Share2], ['Umbrella', Umbrella],
  ['Underline', PenTool], ['Undo', RotateCcw], ['Unlock', Key],
  ['Upload', Upload], ['User', Users], ['UserCheck', UserCheck],
  ['UserPlus', UserPlus], ['Users', Users], ['Utensils', Utensils],
  ['Visitor', Users], ['Volume', Volume2],
  ['Volume1', Volume1], ['Wallet', Wallet], ['Watch', Watch],
  ['Waves', Waves], ['Webhook', Link], ['Wifi', Wifi],
  ['Wind', Wind], ['Wrench', Wrench], ['X', X],
  ['XCircle', XCircle], ['Zap', Zap], ['ZoomIn', ZoomIn],
  ['ZoomOut', ZoomOut], ['Accessibility', Accessibility],
  ['Armchair', Bed], ['Church', Building], ['Hospital', Building],
  ['School', Building], ['Store', Building],
];

export const ICON_MAP: Record<string, LucideIcon> = Object.fromEntries(ICON_LIST);

interface IconPickerModalProps {
  headingName: string;
  currentIcon: string | null;
  saving: boolean;
  onPick: (name: string | null) => void;
  onClose: () => void;
}

export function IconPickerModal({ headingName, currentIcon, saving, onPick, onClose }: IconPickerModalProps) {
  const [iconSearch, setIconSearch] = useState('');

  const filteredIcons = useMemo(() => {
    if (!iconSearch.trim()) return ICON_LIST;
    const q = iconSearch.toLowerCase();
    return ICON_LIST.filter(([name]) => name.toLowerCase().includes(q));
  }, [iconSearch]);

  const CurrentIcon = currentIcon ? ICON_MAP[currentIcon] : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-3xl rounded-2xl border border-border bg-card shadow-2xl">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h3 className="text-lg font-bold">Pick Icon for &ldquo;{headingName}&rdquo; <span className="text-sm font-normal text-muted-foreground">({filteredIcons.length} icons)</span></h3>
          <button onClick={onClose} className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted" aria-label="Close icon picker">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="px-5 py-3">
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={iconSearch}
              onChange={(e) => setIconSearch(e.target.value)}
              placeholder="Search icons... (e.g. star, heart, code, rocket)"
              className="w-full rounded-xl border border-input bg-background py-2.5 pl-9 pr-4 text-sm outline-none focus:border-primary"
              autoFocus
            />
          </div>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs text-muted-foreground">Current: </span>
            {CurrentIcon ? <CurrentIcon className="h-5 w-5 text-primary" /> : <span className="text-xs text-muted-foreground">None</span>}
            {currentIcon && (
              <button onClick={() => onPick(null)} disabled={saving} className="text-xs text-red-500 hover:text-red-600 disabled:opacity-50">Remove</button>
            )}
          </div>
        </div>
        <div className="max-h-[60vh] overflow-y-auto px-5 pb-5">
          <div className="grid grid-cols-6 gap-1.5 sm:grid-cols-8 md:grid-cols-10">
            {filteredIcons.map(([name, Icon]) => (
              <button
                key={name}
                onClick={() => onPick(name)}
                disabled={saving}
                className={`group flex flex-col items-center gap-1 rounded-xl border-2 p-2 transition-all hover:scale-110 disabled:opacity-50 ${
                  currentIcon === name
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-transparent hover:border-border hover:bg-muted text-muted-foreground hover:text-foreground'
                }`}
                title={name}
              >
                <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                <span className="hidden w-full truncate text-center text-[9px] leading-tight sm:block">{name}</span>
              </button>
            ))}
          </div>
          {filteredIcons.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">No icons match &ldquo;{iconSearch}&rdquo;</p>
          )}
        </div>
      </div>
    </div>
  );
}
