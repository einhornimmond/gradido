<?php
/**
 * @var \App\View\AppView $this
 * @var \App\Model\Entity\Operator $operator
 */
?>
<nav class="large-3 medium-4 columns" id="actions-sidebar">
    <ul class="side-nav">
        <li class="heading"><?= __('Actions') ?></li>
        <li><?= $this->Form->postLink(
                __('Delete'),
                ['action' => 'delete', $operator->id],
                ['confirm' => __('Are you sure you want to delete # {0}?', $operator->id)]
            )
        ?></li>
        <li><?= $this->Html->link(__('List Operators'), ['action' => 'index']) ?></li>
    </ul>
</nav>
<div class="operators form large-9 medium-8 columns content">
    <?= $this->Form->create($operator) ?>
    <fieldset>
        <legend><?= __('Edit Operator') ?></legend>
        <?php
            echo $this->Form->control('usernamePasswordHash');
            echo $this->Form->control('operator_type_id');
            echo $this->Form->control('data_base64');
        ?>
    </fieldset>
    <?= $this->Form->button(__('Submit')) ?>
    <?= $this->Form->end() ?>
</div>
