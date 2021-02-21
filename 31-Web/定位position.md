position属性规定了元素的定位类型，所有的元素都可以用position来进行定位。position定位之后的对象将具有块属性。position属性有五个取值，分别为：static、relative、absolute、fixed、inherit，其中“static”为默认值，可以省略不写，static元素会忽略任何top、bottom、left或right声明。

再次强调，所有的元素都可以进行定位处理~！

当对一个元素设置了position:absolute和position:fixed时，会让该元素脱离文档流，从而对父级以及兄弟级元素的布局造成影响。如果元素设置了position:relative，根据W3C官方文档上来说，并不会脱离文档流，也不会有布局上的问题，但是在实际开发中的情况则是：元素不会脱离文档流，但是是可以设置top、left等值进行操作，而且设置也是生效的。

## 元素设置position:absolute时，针对哪个元素定位

设置属性值为 absolute 会将对象拖离出正常的文档流绝对定位而不考虑它周围内容的布局。假如其他具有不同 z-index 属性的对象已经占据了给定的位置，他们之间不会相互影响，而会在同一位置层叠。此时对象不具有外补丁( margin )，但仍有内补丁( padding )和边框( border )。

要激活对象的绝对(absolute)定位，必须指定left，right，top，bottom 属性中的至少一个，并且设置此属性值为 absolute 。否则上述属性会使用他们的默认值 auto ，这将导致对象遵从正常的HTML布局规则，在前一个对象之后立即被呈递。

如果父级（无限）没有设定position属性，那么当前的absolute则结合top，right，left，bottom属性以浏览器左上角为原始点进行定位

如果父级（无限）设定position属性，且属性值为relative、absolute、fixed，那么当前的absolute则结合top，right，left，bottom属性以父级（最近）的左上角为原始点进行定位。

## fixed的定位方式

fixed可定位相对于浏览器窗口的指定坐标.这个元素的位置可通过left、right、top、bottom属性来规定。不论窗口滚动与否，元素都会留在那个位置。但这个标签的兼容性不好，可以用absolute来取代，实现同样的效果。

在IE6.0及以下版本的浏览器里是不支持position:fixed。而在IE7,IE8,firefox,opera,chrome都可以完美的支持此特性

## z-index

z-index设置元素的堆叠顺序，值可以为负。拥有最高堆叠顺序的元素总是会处于堆叠顺序较低的元素前面。z-index只能针对同级的标签有效，也就是说子标签的z-index值对于父标签是无效的，因为两者的级别不同z-index是无法比较的。因此，针对两个设置绝对定位的元素，进行层级比较时，首先应当比较其父级，再比较子级，换句话说——“拼爹”。