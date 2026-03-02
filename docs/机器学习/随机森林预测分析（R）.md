# 随机森林预测分析（R）

这里以项目“付费旅客数据”项目中的数据为例（详见项目技术栈）。

##### 1.导入数据

```r
library(readxl)
all_data <- read_excel("Desktop/all_data.xlsx")
##View(all_data)
str(all_data)
```

![](https://i.loli.net/2021/03/20/VHQEoMyvY6NdITB.png)

##### 2.数据预处理

统计“付费选座”率：

```r
prop.table(table(all_data$emd_lable2))
```

<img src="https://i.loli.net/2021/03/20/5MrbewFTgnXhIfq.png" alt="截屏2021-03-19 下午9.11.19" style="zoom:50%;" />

在所有数据集中，目标乘客（有付费选座倾向）约为9.8%，90.2%的乘客无付费选座行为。



定累变量统计

```r
### 定类变量统计
table(all_data $seg_route_to)
prop.table(table(all_data$seg_route_to))

table(all_data $seg_flight)
prop.table(table(all_data$seg_flight))

table(all_data $seg_cabin)
prop.table(table(all_data$seg_cabin))

#table(all_data $emd_lable)
#prop.table(table(all_data$emd_lable))

table(all_data $gender)
prop.table(table(all_data$gender))

table(all_data $age)
prop.table(table(all_data$age))

table(all_data $乘坐次数最多的舱位)
prop.table(table(all_data$乘坐次数最多的舱位))

table(all_data $偏好机型)
prop.table(table(all_data$偏好机型))

table(all_data $偏好机型)
prop.table(table(all_data$偏好机型))
```

![](https://i.loli.net/2021/03/20/27WOkHMnd5eJPDo.png)

![](https://i.loli.net/2021/03/20/yK2N5RVSYwcaBq9.png)

##### 3.数据分类

将数据分为训练数据集80%（共12,147条） 和 测试数据集20%（共2,992条）。

```r
#数据分类
ind <- sample(2,nrow(all_data),replace = TRUE,prob = c(0.8,0.2))
train_data <- all_data[ind==1,] #训练数据集
test_data <- all_data[ind==2,] #测试数据集

str(train_data)
str(test_data)
```

##### 4.寻找最优mtry

mtry参数即指定节点中用于二叉树的最佳变量个数。

```
library(randomForest)

n <- length(names(train_data))
rate=1 #设置模型误判率向量初始值
for (i in 1:(n-1)) {
  set.seed(1234)
  rf_train <- randomForest(factor(emd_lable2)~.,data = train_data,mytree=i,ntree=1000)
  rate[i] <- mean(rf_train$err.rate)  #计算基于OOB数据的模型误判率均值
  print(rf_train)
}
```

展示所有模型误判率的均值：

```r
Call:
 randomForest(formula = factor(emd_lable2) ~ ., data = train_data,      mytree = i, ntree = 1000) 
               Type of random forest: classification
                     Number of trees: 1000
No. of variables tried at each split: 3

        OOB estimate of  error rate: 7.02%
Confusion matrix:
      0   1 class.error
0 10932  33 0.003009576
1   820 362 0.693739425

Call:
 randomForest(formula = factor(emd_lable2) ~ ., data = train_data,      mytree = i, ntree = 1000) 
               Type of random forest: classification
                     Number of trees: 1000
No. of variables tried at each split: 3

        OOB estimate of  error rate: 7.02%
Confusion matrix:
      0   1 class.error
0 10932  33 0.003009576
1   820 362 0.693739425

Call:
 randomForest(formula = factor(emd_lable2) ~ ., data = train_data,      mytree = i, ntree = 1000) 
               Type of random forest: classification
                     Number of trees: 1000
No. of variables tried at each split: 3

        OOB estimate of  error rate: 7.02%
Confusion matrix:
      0   1 class.error
0 10932  33 0.003009576
1   820 362 0.693739425

Call:
 randomForest(formula = factor(emd_lable2) ~ ., data = train_data,      mytree = i, ntree = 1000) 
               Type of random forest: classification
                     Number of trees: 1000
No. of variables tried at each split: 3

        OOB estimate of  error rate: 7.02%
Confusion matrix:
      0   1 class.error
0 10932  33 0.003009576
1   820 362 0.693739425

Call:
 randomForest(formula = factor(emd_lable2) ~ ., data = train_data,      mytree = i, ntree = 1000) 
               Type of random forest: classification
                     Number of trees: 1000
No. of variables tried at each split: 3

        OOB estimate of  error rate: 7.02%
Confusion matrix:
      0   1 class.error
0 10932  33 0.003009576
1   820 362 0.693739425

Call:
 randomForest(formula = factor(emd_lable2) ~ ., data = train_data,      mytree = i, ntree = 1000) 
               Type of random forest: classification
                     Number of trees: 1000
No. of variables tried at each split: 3

        OOB estimate of  error rate: 7.02%
Confusion matrix:
      0   1 class.error
0 10932  33 0.003009576
1   820 362 0.693739425

Call:
 randomForest(formula = factor(emd_lable2) ~ ., data = train_data,      mytree = i, ntree = 1000) 
               Type of random forest: classification
                     Number of trees: 1000
No. of variables tried at each split: 3

        OOB estimate of  error rate: 7.02%
Confusion matrix:
      0   1 class.error
0 10932  33 0.003009576
1   820 362 0.693739425

Call:
 randomForest(formula = factor(emd_lable2) ~ ., data = train_data,      mytree = i, ntree = 1000) 
               Type of random forest: classification
                     Number of trees: 1000
No. of variables tried at each split: 3

        OOB estimate of  error rate: 7.02%
Confusion matrix:
      0   1 class.error
0 10932  33 0.003009576
1   820 362 0.693739425

Call:
 randomForest(formula = factor(emd_lable2) ~ ., data = train_data,      mytree = i, ntree = 1000) 
               Type of random forest: classification
                     Number of trees: 1000
No. of variables tried at each split: 3

        OOB estimate of  error rate: 7.02%
Confusion matrix:
      0   1 class.error
0 10932  33 0.003009576
1   820 362 0.693739425

Call:
 randomForest(formula = factor(emd_lable2) ~ ., data = train_data,      mytree = i, ntree = 1000) 
               Type of random forest: classification
                     Number of trees: 1000
No. of variables tried at each split: 3

        OOB estimate of  error rate: 7.02%
Confusion matrix:
      0   1 class.error
0 10932  33 0.003009576
1   820 362 0.693739425

Call:
 randomForest(formula = factor(emd_lable2) ~ ., data = train_data,      mytree = i, ntree = 1000) 
               Type of random forest: classification
                     Number of trees: 1000
No. of variables tried at each split: 3

        OOB estimate of  error rate: 7.02%
Confusion matrix:
      0   1 class.error
0 10932  33 0.003009576
1   820 362 0.693739425

Call:
 randomForest(formula = factor(emd_lable2) ~ ., data = train_data,      mytree = i, ntree = 1000) 
               Type of random forest: classification
                     Number of trees: 1000
No. of variables tried at each split: 3

        OOB estimate of  error rate: 7.02%
Confusion matrix:
      0   1 class.error
0 10932  33 0.003009576
1   820 362 0.693739425

Call:
 randomForest(formula = factor(emd_lable2) ~ ., data = train_data,      mytree = i, ntree = 1000) 
               Type of random forest: classification
                     Number of trees: 1000
No. of variables tried at each split: 3

        OOB estimate of  error rate: 7.02%
Confusion matrix:
      0   1 class.error
0 10932  33 0.003009576
1   820 362 0.693739425

Call:
 randomForest(formula = factor(emd_lable2) ~ ., data = train_data,      mytree = i, ntree = 1000) 
               Type of random forest: classification
                     Number of trees: 1000
No. of variables tried at each split: 3

        OOB estimate of  error rate: 7.02%
Confusion matrix:
      0   1 class.error
0 10932  33 0.003009576
1   820 362 0.693739425
```

从1至14对模型OOB没有差别，故mytree参数值在该模型中可以不用设置。



> **OOB误分率：**
>
> ​	构建随机森林的另一个关键问题就是如何选择最优的m（特征个数），要解决这个问题主要依据计算袋外错误率oob error（out-of-bag error）。
>
> 　　 随机森林有一个重要的优点就是，没有必要对它进行交叉验证或者用一个独立的测试集来获得误差的一个无偏估计。它可以在内部进行评估，也就是说在生成的过程中就可以对误差建立一个无偏估计。
>
> 　　 我们知道，在构建每棵树时，我们对训练集使用了不同的bootstrap sample（随机且有放回地抽取）。所以对于每棵树而言（假设对于第k棵树），大约有1/3的训练实例没有参与第k棵树的生成，它们称为第k棵树的oob样本。
>
> OOB误分率是随机森林泛化误差的一个无偏估计，它的结果近似于需要大量计算的k折交叉验证。



##### 5.寻找最优ntree

即最佳决策树数目

```
rf_1 <- randomForest(factor(emd_lable2)~.,data = train_data,ntree=530)
plot(rf_1) #绘制模型误差与ntree的关系图

emd_lable2_pre_rf1 <- predict(rf_1,newdata = test_data)
```

![](https://i.loli.net/2021/03/20/H7SwFWckm9rJEAb.png)

在ntree等于500左右，模型误差基本稳定，故ntree取500。

##### 6.查看调整后的结果

```r
rf <- randomForest(factor(emd_lable2)~.,data = train_data,ntree=500)
rf
```

![](/Users/suneann/Library/Application Support/typora-user-images/截屏2021-03-20 下午1.32.48.png)

OOB误差为6.98%（我也不知道算不算高，好像有点高）

```r
plot(rf)##绘制每棵树的误判率图
```

<img src="https://i.loli.net/2021/03/20/PKijDaZJSWHOhI4.png" style="zoom: 50%;" />



##### 7.查看指标重要性

```
varImpPlot(rf, main = "variable importance")
```

<img src="https://i.loli.net/2021/03/20/FPKCRTVes5J8Ntd.png" style="zoom:50%;" />

```
par(mfrow=c(1,2))
rf<- randomForest(factor(emd_lable2)~.,data = train_data,ntree=500,importance=TRUE,proximity=TRUE)
importance(rf_1,type = 1)[,1] %>% barplot(cex.names=0.8,main = " MeanDecreaseAccuracy")
importance(rf_1,type = 2)[,1] %>% barplot(cex.names=0.8,main = " MeanDecreaseGini")
```

![](https://i.loli.net/2021/03/20/t2jYuR8JNG9vKpU.png)

> **mean decrease accuracy**
>
> 把一个变量的取值变为随机数，随机森林预测准确性的降低程度。该值越大表示该变量的重要性越大。
>
> **mean decrease gini**
>
> 计算每个变量对分类树每个节点上观测值的异质性的影响，从而比较变量的重要性。该值越大表示该变量的重要性越大。



##### 8.模型预测

```
emd_lable2_pre_rf <- predict(rf,newdata = test_data)
write.csv(emd_lable2_pre_rf,file ="Desktop/rt_result.csv")
```

<img src="https://i.loli.net/2021/03/20/vIluX9To1jA5hOw.png" alt="截屏2021-03-20 下午2.03.55" style="zoom:50%;" />



##### 9.检验模型

```r
pp <- table(emd_lable2_pre_rf,test_data$emd_lable2)
accrucy_rf1 <- sum(diag(pp))/length(test_data$emd_lable2)
accrucy_rf1 ##预测准确度

## 0.9247995
```

##### 10.绘制ROC曲线和AUC值

```r
#对测试集进行预测
pre_ran <- predict(emd_lable2_pre_rf,newdata=test_data)
#将真实值和预测值整合到一起
obs_p_ran = data.frame(prob=emd_lable2_pre_rf,obs=test_data$emd_lable2)
#输出混淆矩阵
table(test_data$emd_lable2,emd_lable2_pre_rf,dnn=c("真实值","预测值"))
```

![](https://i.loli.net/2021/03/20/zEt1uVXHvpd3nOk.png)

```r
#绘制ROC曲线
ran_roc <- roc(test_data$emd_lable2,as.numeric(emd_lable2_pre_rf))
plot(ran_roc, print.auc=TRUE, auc.polygon=TRUE, grid=c(0.1, 0.2),grid.col=c("green", "red"), max.auc.polygon=TRUE,auc.polygon.col="skyblue", print.thres=TRUE,main='randomForest ROC,ntree=500')
```

<img src="https://i.loli.net/2021/03/20/tBw3v5lz7oyW2Ad.png" alt="截屏2021-03-20 下午2.27.15" style="zoom:50%;" />

（由于这份数据还没有进行清洗，所以结果不太好看，毕竟“特征工程决定机器学习上限”。）