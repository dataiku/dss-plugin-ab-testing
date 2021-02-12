# AB Testing Plugin

This plugin provides features to design AB testing and analyses their outcome inside DSS. 

## Design

A web app computes the minimum sample sizes needed in the experiment while providing insightful visualisations of the distributions (Z test). A custom recipe can then use these estimated figures to split the input dataset containing the email addresses of the experiment population into two groups, A and B. 

Here is a more detailled description of these two main components : 

### 1- A/B test sample size calculator (custom web app)

This visual web app computes the required sample size to conduct the experiment. 

#### Input

`Parameters` folder where the parameters and sample sizes are stored.

#### Experiment parameters

Inside the web app, you may input your different parameters to compute the sample size : 

* **Baseline success rate (%)** : current success rate of the variant
* **Minimal detectable effect (%)**: the minimal variation of the baseline conversion rate that you need to detect a statistically significant change.
* **Daily number of people exposed**
* **Percentage of the traffic affected**

From these values, a minimum sample size is computed and illustrated thanks to the chart of the distributions. 

#### Output

There is no output, but when you click on the button save parameters, the parameters and the samples sizes are saved in the folder `Parameters` .

### 2- Population split (custom recipe)

This recipe splits the users enrolled in the experiment into two groups, usually based on the sample sizes which were previously computed in the `AB testing design` web app. 

#### Input

* `Population dataset` : Dataset with the reference of the users involved in the experiment(ids, emails...)
* `Parameters folder` (optional) : Folder containing the parameters computed in the `AB testing design` web app, previously introduced. 

#### Parameters

* **User reference** : Column containing user reference (user Id , email...). Each user should have a unique reference.
* **Sample size definition**: do you want to retrieve the sample sizes from the web app or edit them manually? 
* **Parameters (computed in the web app)**: if you want to retrieve the sample sizes from the `parameters folder` , choose which json file contains the right parameters and sample sizes. 
* **Sample size for variation A** : Minimum sample size for the A group
* **Sample size for variation B** : Minimum sample size for the B group
* **Deal with leftover users** :  If the population is greater than the sample size, this field specifies in which group the leftover users should go.

#### Output

* `Experiment dataset` : Input dataset with an extra column containing the group indicators used for the AB test (A or B)

## Analysis of the results

Once the experiment is complete, the user may upload the results back to DSS. With a custom recipe, she computes the resulting statistics (conversion rate per group). With the second web app, she can analyse these results and determine the outcome of the statistical test. 

### 3- Experiment summary (custom recipe) 

From the results of your experiment, this recipe computes the statistics required to analyse the outcome of the statistical test.

#### Input

* `experiment_results` : This dataset should contain the experiment's results at a user level. There should be group column and a conversion column. 

#### Parameters

* **User reference** : Column containing user reference (user Id , email...). Each user should have a unique reference.
* **Conversion column** : Column indicating if a user converted or not (Binary values)
* **AB group column** : Column indicating to which group a user belongs. This column should contain binary values (O-1, A-B, group_A-group_B)

#### Output

* `AB testing statistics` : Statistics required to answer the statistical test

### 4- Results analysis (custom web app)

From the `AB testing statistics` dataset, this web app gives a clear answer to the statistical test. Make sure to **refresh** the settings page when you open it.  

#### Input

* `AB testing statistics` : Statistics required to answer the statistical test

#### Parameters

* **AB statistics entry from** : do you want to retrieve statistics from the `AB testing statistics` dataset or just enter the values manually?
* **Dataset** : It should be the output of the recipe AB statistics of the AB testing plugin. Otherwise, use the manual mode
* **AB group column** : Column indicating to which group a user belongs (A or B)
* **Output folder for results** :  Where do you want to save the results of the experiment?

#### Output

There is no output, but when you click on the button save results, the results are saved in the output folder. 
