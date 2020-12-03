function Mine(tr,td,mineNum){
    this.tr=tr;     //行数
    this.td=td;     //列数
    this.mineNum=mineNum;       //雷的数量

    this.squares=[];        //存储所有方块的信息，是一个二维数组,采用行和列的存取形式
    this.tds=[];        //储存所有单元格的DOM
    this.surplusMine=mineNum;       //剩余雷的数量
    this.allRight=false;        //P判断游戏是否结束

    this.parent=document.querySelector('.map');
}

//生成n个不重复的数字，代表每一个格子
Mine.prototype.randomNum=function(){
    var square = new Array(this.tr*this.td);
    for(var i=0;i<square.length;i++){   //给每一个放个编号
        square[i]=i;
    }
    square.sort(function(){return 0.5-Math.random()});  //给数组随机排序，
    return square.slice(0,this.mineNum);    //切取雷的个数个编号
}

//初始化
 Mine.prototype.init=function(){
     var rn=this.randomNum();  //雷在格子里的位置；
     var n=0;    //遍历所有格子的索引
     for(var i=0;i<this.tr;i++){
         this.squares[i]=[];
         for(var j=0;j<this.td;j++){
             this.squares[i][j]=[];
             n++;
             if(rn.indexOf(n) != -1){    //索引n在雷的数组里则不返回-1，表示这个索引是个雷
                 this.squares[i][j]={type:'mine',x:j,y:i};
             }else{
                 this.squares[i][j]={type:'number',x:j,y:i,value:0};
             }
         }
     }
     this.updateNum();
     this.createDom();
     this.parent.oncontextmenu=function(){
         return false;
     }
     //console.log(this.randomNum())
    this.mineNumDom=document.querySelector('.mineNum');
    this.mineNumDom.innerHTML=this.surplusMine;
 }

//创建表格
Mine.prototype.createDom=function(){
    var This=this;
    var table = document.createElement('table');

    for(var i=0;i<this.tr;i++){
        var domTr=document.createElement('tr');
        this.tds[i]=[];

        for(var j=0;j<this.td;j++){
            var domTd=document.createElement('td');
            //domTd.innerHTML=0;
            this.tds[i][j]=domTd;
            domTr.appendChild(domTd);

            domTd.pos=[i,j];    //
            domTd.onmousedown=function(){
                This.play(event,this)   //This指的是实例对象，this指的是点击的td
            };
            //  if(this.squares[i][j].type == 'mine'){
            //      domTd.className='mine';
            //  }
            //  if(this.squares[i][j].type == 'number'){
            //     domTd.innerHTML=this.squares[i][j].value;
            // }
         }
        table.appendChild(domTr);
    }
    this.parent.innerHTML='';
    this.parent.appendChild(table);
}

//找到格子的周围
Mine.prototype.getAround=function(square){
    var x=square.x;
    var y=square.y;
    var result=[];

    for(var i=x-1;i<=x+1;i++){
        for(var j=y-1;j<=y+1;j++){
            if(i<0 || j<0 || i>this.td-1 || j>this.tr-1 || (i==x && j==y) || this.squares[j][i].type=='mine'){
                continue;
            }
            result.push([j,i]);
        }

    }
    return result;
}

Mine.prototype.updateNum=function(){
    for(var i=0;i<this.tr;i++){
        for(var j=0;j<this.td;j++){
            if(this.squares[i][j].type=='number'){
                continue;
            }
            var num=this.getAround(this.squares[i][j]);
            for(var k=0;k<num.length;k++){
                this.squares[num[k][0]][num[k][1]].value+=1;
            }
        }
    }
    //console.log(this.squares);
}

Mine.prototype.play=function(ev,obj){
    var This=this;
    if(ev.which==1 && obj.className!='mark'){    //如果点击的是左键
        //console.log(obj);
        var cl=['zero','one','two','three','four','five','six','seven','eight']
        var curSquare=this.squares[obj.pos[0]][obj.pos[1]];
        if(curSquare.type=='number'){
            //console.log('diandaoshuzi');
            obj.innerHTML=curSquare.value;
            obj.className=cl[curSquare.value];  
            if(curSquare.value==0){
                obj.innerHTML='';
                function getAllZero(square){
                    var around=This.getAround(square);  //找到了周围的n个格子
                    for(var i=0;i<around.length;i++){
                        var x=around[i][0]; //行
                        var y=around[i][1]; //列
                        This.tds[x][y].className=cl[This.squares[x][y].value];

                        if(This.squares[x][y].value==0){    //如果找到的格子中有值为0的
                            if(!This.tds[x][y].cherk){  //给对应的td添加一个属性，如果这个格子被找过，那么cherk值为真，不会再次查找，防止无限循环
                                This.tds[x][y].cherk=true;
                                getAllZero(This.squares[x][y]);
                            }
                        }else{
                            This.tds[x][y].innerHTML=This.squares[x][y].value;
                        }
                    }
                }
                getAllZero(curSquare);
            }
        }else{
            //console.log('diandaoleile')
            //obj.className='mine';
            this.gameOver(obj);
        }
    }
    if(ev.which==3){
        if(obj.className && obj.className!='mark'){ //如果点击的是一个数字，那就不能点击
            return;
        }
        obj.className=obj.className=='mark'?'':'mark';  //切换class

        if(this.squares[obj.pos[0]][obj.pos[1]].type=='mine'){
            this.allRight=true;
        }else{
            this.allRight=false;
        }
        if(obj.className!='mark'){
            this.mineNumDom.innerHTML=++this.surplusMine;
        }else{
            this.mineNumDom.innerHTML=--this.surplusMine;
        }
        if(this.surplusMine==0){

       
            if(this.allRight=true){
            alert("恭喜你，游戏通关！")
            }else{
            alert("很遗憾，游戏失败！")
            }
        }
        
    }
}

Mine.prototype.gameOver=function(clickTd){
    for(i=0;i<this.tr;i++){
        for(j=0;j<this.td;j++){
            if(this.squares[i][j].type=='mine'){
                this.tds[i][j].className='mine';
            }
            this.tds[i][j].onmousedown=null;
        }
    }
    if(clickTd){
        clickTd.style.backgroundColor='#f00';
        //alert("很遗憾，游戏结束！");
    }
}

var btns=document.querySelectorAll('.level button');
var mine=null;  //用来储存生成的实例
var ln=0;   //用来储存当前选中的状态
var arr=[[9,9,10],[16,16,40],[28,28,99]];

for(let i=0;i<btns.length-1;i++){
    btns[i].onclick=function(){
        btns[ln].className='';
        this.className='active'
        mine=new Mine(...arr[i]);
        mine.init();
        ln=i;
    }
}
btns[0].onclick();
btns[3].onclick=function(){
    mine.init();
}

//var mine=new Mine(16,30,99);
//mine.init();
//console.log(mine.getAround(mine.squares[0][0]));