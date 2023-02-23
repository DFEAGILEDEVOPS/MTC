class UpnHelper
  def self.collection_of_la_codes
    begin
      SqlDbHelper.get_list_of_la_codes
    rescue NameError => e
      %w(
        201
        202
        203
        204
        205
        206
        207
        208
        209
        210
        211
        212
        213
        301
        302
        303
        304
        305
        306
        307
        308
        309
        310
        311
        312
        313
        314
        315
        316
        317
        318
        319
        320
        330
        331
        332
        333
        334
        335
        336
        340
        341
        342
        343
        344
        350
        351
        352
        353
        354
        355
        356
        357
        358
        359
        370
        371
        372
        373
        380
        381
        382
        383
        384
        390
        391
        392
        393
        394
        420
        660
        661
        662
        663
        664
        665
        666
        667
        668
        669
        670
        671
        672
        673
        674
        675
        676
        677
        678
        679
        680
        681
        701
        702
        704
        705
        706
        707
        708
        800
        801
        802
        803
        805
        806
        807
        808
        810
        811
        812
        813
        815
        816
        821
        822
        823
        825
        826
        830
        831
        835
        836
        837
        838
        839
        840
        841
        845
        846
        850
        851
        852
        855
        856
        857
        860
        861
        865
        866
        867
        868
        869
        870
        871
        872
        873
        874
        876
        877
        878
        879
        880
        881
        882
        883
        884
        885
        886
        887
        888
        889
        890
        891
        892
        893
        894
        895
        896
        908
        909
        916
        919
        921
        925
        926
        928
        929
        931
        933
        935
        936
        937
        938
        940
        941
        942
        943
       )
    end
  end

  def self.check_letter_hash
    {
      0 => 'A',
      1 => 'B',
      2 => 'C',
      3 => 'D',
      4 => 'E',
      5 => 'F',
      6 => 'G',
      7 => 'H',
      8 => 'J',
      9 => 'K',
      10 => 'L',
      11 => 'M',
      12 => 'N',
      13 => 'P',
      14 => 'Q',
      15 => 'R',
      16 => 'T',
      17 => 'U',
      18 => 'V',
      19 => 'W',
      20 => 'X',
      21 => 'Y',
      22 => 'Z'
    }
  end


  def self.temporary_letter(remainder)
    check_letter_hash[remainder]
  end
end
