# 详解策略模式

## 使用策略模式计算奖金

策略模式有着广泛的应用。JavaScript设计模式与开发实践中以年终奖的计算为例进行介绍。

很多公司的年终奖是根据员工的工资基数和年底绩效情况来发放的。例如，绩效为S的人年终奖有4倍工资，绩效为A的人年终奖有3倍工资，而绩效为B的人年终奖是2倍工资。假设财务部要求我们提供一段代码，来方便他们计算员工的年终奖。

```javascript
var calculateBonus = function(performanceLevel,salary){
    if(performanceLevel === "S"){
        return salary * 4;
    }
    if(performanceLevel === "A"){
        return salary * 3;
    }
    if(performanceLevel === "B"){
        return salary * 2;
    }
}
```

这段代码十分简单，但是存在着显而易见的缺点。

- `calculateBonus`函数比较庞大，包含了很多的`if`语句，这些语句需要覆盖所有的逻辑分支。
- `calculateBonus`函数缺乏弹性，如果增加了一种新的绩效等级C，或者想把绩效S的奖金系数改为5，那我们必须深入`calculateBonus`函数的内部实现，这是违反开放-封闭原则的。
- 算法的复用性差，如果在程序的其他地方需要重用这些计算奖金的算法呢？我们的选择只有复制和粘贴。

## 使用策略模式重构代码

```javascript
var performanceS = function(){};
performanceS.prototype.calculate = function(salary) {
    return salary * 4;
}
var performanceA = function(){};
performanceA.prototype.calculate = function(salary) {
    return salary * 3;
}
var performanceB = function(){};
performanceB.prototype.calculate = function(salary) {
    return salary * 2;
}
var Bonus = function() {
    this.salary = null;
    this.strategy = null;
}
Bonus.prototype.setSalary = function(salary) {
    this.salary = salary;
}
Bonus.prototype.setStrategy = function(salary) {
    this.strategy = strategy;
}
Bonus.prototype.getBonus = function(salary) {
    return this.strategy.calculate(this.salary)
}
var bonus = new Bonus()
bonus.setSalary(10000)
bonus.setStrategy(new performanceS())
console.log(bonus.getBonus())
```

## 适用于JavaScript版本的策略模式

```javascript
var strategies = {
    "S": function(salary) {
        return salary * 4
    },
    "A": function(salary) {
        return salary * 3
    },
    "B": function(salary) {
        return salary * 2
    }
}
var calculateBonus = function(level,salary) {
    return strategies[level](salary)
}
console.log(calculateBonus("S",10000))
```

